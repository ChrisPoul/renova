import { json } from '@sveltejs/kit';
import * as XLSX from 'xlsx';
import { db } from '$lib/server/db';
import { 
	employeesTable, 
	employeesToWeeksTable, 
	categoriesTable, 
	categoriesToWeeksTable, 
	incidencesTable
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { parseExcelNumber } from '$lib/utils';
import { SYSTEM_EXCEL_COLUMNS } from '$lib/constants';

export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const weekId = formData.get('weekId') as string;
		
		if (!file) {
			return json({ success: false, error: 'No file provided' }, { status: 400 });
		}

		if (!weekId) {
			return json({ success: false, error: 'No week ID provided' }, { status: 400 });
		}

		// Leer el archivo Excel
		const buffer = await file.arrayBuffer();
		const workbook = XLSX.read(buffer, { type: 'array' });
		
		// Obtener la primera hoja
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		
		// Convertir a JSON con headers como array (índice de fila)
		const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
			header: 1, 
			defval: null,
			raw: false 
		}) as any[][];
		
		// 1. Leer fila 8 (índice 7) para encontrar headers
		const headerRow = jsonData[7]; // Fila 8 (0-indexed)
		if (!headerRow || headerRow.length === 0) {
			return json({ success: false, error: 'No se encontró la fila de headers (fila 8)' }, { status: 400 });
		}

		const headerIndices = new Map<string, number>();
		headerRow.forEach((header, idx) => {
			if (header !== null && header !== undefined && header.toString().trim() !== '') {
				headerIndices.set(header.toString().trim(), idx);
			}
		});

		// 2. Detectar empleados (columna A = número) y extraer datos
		const employeeData: Array<{
			codigo: string;
			nombre: string;
			values: Map<string, number>; // Map<concepto, valor>
		}> = [];

		// Empezar desde fila 9 (índice 8) hasta el final
		for (let i = 8; i < jsonData.length; i++) {
			const row = jsonData[i];
			if (!row || row.length === 0) continue;

			const codigo = row[0];
			
			// Verificar si es un empleado (columna A es un número)
			if (codigo && /^\d+$/.test(codigo.toString().trim())) {
				const nombre = row[1]?.toString().trim() || '';
				
				// Validar nombre: debe ser string no vacío
				if (!nombre || nombre.length === 0) {
					continue;
				}

				// Extraer valores de las columnas encontradas
				const values = new Map<string, number>();
				for (const col of SYSTEM_EXCEL_COLUMNS) {
					const colIndex = headerIndices.get(col.excelHeader);
					if (colIndex !== undefined) {
						const valor = row[colIndex];
						const parsedValue = parseExcelNumber(valor);
						values.set(col.concepto, parsedValue);
					}
				}
				employeeData.push({
					codigo: codigo.toString().trim(),
					nombre,
					values
				});
			}
		}

		if (employeeData.length === 0) {
			return json({ success: false, error: 'No se encontraron empleados válidos en el archivo' }, { status: 400 });
		}

		// Usar transacción para importación completa
		const result = await db.transaction(async (tx) => {
			// 1. Limpiar datos existentes de la semana
			await tx.delete(incidencesTable).where(eq(incidencesTable.weekId, parseInt(weekId)));
			await tx.delete(employeesToWeeksTable).where(eq(employeesToWeeksTable.weekId, parseInt(weekId)));
			await tx.delete(categoriesToWeeksTable).where(eq(categoriesToWeeksTable.weekId, parseInt(weekId)));
			
			// 2. Crear/actualizar empleados
			const employeeIds = new Map<string, number>();
			const employeeDataMap = new Map<string, { salary: number; puesto: string; area: string; cede: string }>();
			
			for (const empData of employeeData) {
				const codigo = empData.codigo;
				const nombre = empData.nombre;
				
				// Buscar empleado existente por código
				const existingEmployee = await tx.query.employeesTable.findFirst({
					where: eq(employeesTable.codigo, codigo)
				});
				
				let employeeId: number;
				if (existingEmployee) {
					// Actualizar empleado existente (solo nombre, mantener otros datos)
					await tx.update(employeesTable)
						.set({ name: nombre })
						.where(eq(employeesTable.id, existingEmployee.id));
					employeeId = existingEmployee.id;
					employeeDataMap.set(codigo, {
						salary: existingEmployee.salary,
						puesto: existingEmployee.puesto,
						area: existingEmployee.area,
						cede: existingEmployee.cede
					});
				} else {
					// Crear nuevo empleado con valores por defecto
					const [newEmployee] = await tx.insert(employeesTable).values({
						codigo,
						name: nombre,
						puesto: 'Sin puesto',
						area: 'Sin área',
						salary: 0,
						cede: 'Sin cede'
					}).returning();
					employeeId = newEmployee.id;
					employeeDataMap.set(codigo, {
						salary: newEmployee.salary,
						puesto: newEmployee.puesto,
						area: newEmployee.area,
						cede: newEmployee.cede
					});
				}
				
				employeeIds.set(codigo, employeeId);
				
				// Agregar empleado a la semana
				const existingEmployeeToWeek = await tx.query.employeesToWeeksTable.findFirst({
					where: (employeesToWeeks, { and, eq }) => and(
						eq(employeesToWeeks.employeeId, employeeId),
						eq(employeesToWeeks.weekId, parseInt(weekId))
					)
				});

				if (!existingEmployeeToWeek) {
					const empInfo = employeeDataMap.get(codigo)!;
					await tx.insert(employeesToWeeksTable).values({
						employeeId,
						weekId: parseInt(weekId),
						salary: empInfo.salary,
						puesto: empInfo.puesto,
						area: empInfo.area,
						cede: empInfo.cede
					});
				}
			}
			
			// 3. Crear categorías para todas las columnas en SYSTEM_EXCEL_COLUMNS
			const categoryIds = new Map<string, number>();
			
			for (const col of SYSTEM_EXCEL_COLUMNS) {
				const concepto = col.concepto;
				
				let categoryType = 'bono'
				
				// Buscar categoría existente por concepto
				const existingCategory = await tx.query.categoriesTable.findFirst({
					where: eq(categoriesTable.concept, concepto)
				});
				
				let categoryId: number;
				let finalCategoryType: string;
				let finalUnit: string;
				let finalUnitValueIsDerived: boolean;
				let finalUnitMonetaryValue: number;

				if (existingCategory) {
					categoryId = existingCategory.id;
					finalCategoryType = existingCategory.type;
					finalUnit = existingCategory.unit;
					finalUnitValueIsDerived = existingCategory.unitValueIsDerived;
					finalUnitMonetaryValue = existingCategory.unitMonetaryValue;
				} else {
					// Crear nueva categoría
					const [newCategory] = await tx.insert(categoriesTable).values({
						concept: concepto,
						type: categoryType,
						unit: '$',
						unitMonetaryValue: 1,
						unitValueIsDerived: false
					}).returning();
					categoryId = newCategory.id;
					finalCategoryType = categoryType;
					finalUnit = '$';
					finalUnitValueIsDerived = false;
					finalUnitMonetaryValue = 1;
				}
				
				categoryIds.set(concepto, categoryId);
				
				// Agregar categoría a la semana
				await tx.insert(categoriesToWeeksTable).values({
					categoryId,
					weekId: parseInt(weekId),
					concept: concepto,
					type: finalCategoryType,
					unit: finalUnit,
					unitMonetaryValue: finalUnitMonetaryValue,
					unitValueIsDerived: finalUnitValueIsDerived
				});
			}
			
			// 4. Crear incidencias para todas las categorías
			let incidencesCreated = 0;
			for (const empData of employeeData) {
				const codigo = empData.codigo;
				const employeeId = employeeIds.get(codigo);
				if (!employeeId) continue;
				
				// Crear incidencia para cada categoría en SYSTEM_EXCEL_COLUMNS
				for (const col of SYSTEM_EXCEL_COLUMNS) {
					const concepto = col.concepto;
					const value = empData.values.get(concepto);
					
					if (value !== undefined) {
						const categoryId = categoryIds.get(concepto);
						if (categoryId) {
							await tx.insert(incidencesTable).values({
								employeeId,
								categoryId,
								weekId: parseInt(weekId),
								amount: value,
								basedOnCategory: true,
								unit: '$',
								unitMonetaryValue: 1,
								unitValueIsDerived: false
							});
							incidencesCreated++;
						}
					}
				}
			}
			
			return {
				employeesImported: employeeData.length,
				categoriesImported: categoryIds.size,
				incidencesCreated
			};
		});
		
		return json({ 
			success: true, 
			message: 'Excel del Sistema importado exitosamente!',
			stats: {
				totalEmployees: result.employeesImported,
				totalCategories: result.categoriesImported,
				totalIncidences: result.incidencesCreated,
				weekId: parseInt(weekId)
			}
		});

	} catch (error) {
		console.error('Error importing System Excel:', error);
		return json({ success: false, error: 'Error importing Excel file' }, { status: 500 });
	}
}

