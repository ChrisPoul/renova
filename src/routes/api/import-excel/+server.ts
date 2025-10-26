import { json } from '@sveltejs/kit';
import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { db } from '$lib/server/db';
import { 
	employeesTable, 
	employeesToWeeksTable, 
	categoriesTable, 
	categoriesToWeeksTable, 
	incidencesTable,
	weeksTable
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { parseExcelNumber } from '$lib/utils';

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
		
		// Convertir a JSON con headers como claves
		const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
			header: 1, 
			defval: null,
			raw: false 
		});
		
		// También obtener datos estructurados por fila
		const structuredData = XLSX.utils.sheet_to_json(worksheet, { 
			header: 1,
			defval: null,
			raw: false,
			range: 2 // Empezar desde la fila 3 (índice 2)
		});
		
		// Guardar jsonData en archivo JSON para análisis
		const jsonFilePath = join(process.cwd(), 'excel-data.json');
		writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
		console.log(`Excel data saved to: ${jsonFilePath}`);
		
		// Obtener headers (fila 1)
		const headers = jsonData[1] as string[];
		
		// Crear un mapa de datos más estructurado
		const structuredRows = [];
		for (let i = 2; i < jsonData.length; i++) {
			const row = jsonData[i] as any[];
			if (!row || row.length === 0) continue;
			
			// Detectar si es una fila de totales
			const firstCell = row[0];
			if (typeof firstCell === 'string' && 
				(firstCell.includes('DESCUENTOS') || firstCell.includes('BANAMEX') || firstCell.includes('TOTAL'))) {
				break;
			}
			
			// Crear objeto estructurado por columna
			const structuredRow: any = {};
			headers.forEach((header, index) => {
				structuredRow[header] = row[index];
			});
			
			// Validaciones más estrictas
			const codigo = structuredRow['Código'];
			const nombre = structuredRow['Empleado'];
			
			// Validar código: debe ser un número (string o number)
			const codigoValido = codigo && (
				(typeof codigo === 'string' && /^\d+$/.test(codigo.trim())) ||
				(typeof codigo === 'number' && !isNaN(codigo))
			);
			
			// Validar nombre: debe ser string no vacío y no solo espacios
			const nombreValido = nombre && 
				typeof nombre === 'string' && 
				nombre.trim().length > 0;
			
			// Solo agregar si pasa todas las validaciones
			if (codigoValido && nombreValido) {
				structuredRows.push(structuredRow);
			}
		}
		
		// Identificar columnas de empleados
		const employeeColumns = ['Código', 'Empleado', 'PUESTO', 'AREA', 'SUELDO 2025'];
		const foundEmployeeColumns = headers.filter(header => 
			employeeColumns.includes(header?.toString() || '')
		);
		
		// Identificar columnas de categorías (todas las demás)
		const categoryColumns = headers.filter(header => 
			!employeeColumns.includes(header?.toString() || '') && 
			header && 
			header.toString().trim() !== '' &&
			header.toString() !== 'SUELDO 2024' // Ignorar SUELDO 2024
		);
		
		// Usar los datos estructurados
		const employeeData = structuredRows;
		
		console.log('=== EXCEL IMPORT START ===');
		console.log('Headers:', headers);
		console.log('Employee columns found:', foundEmployeeColumns);
		console.log('Category columns found:', categoryColumns);
		console.log('Total employees (after validation):', employeeData.length);
		console.log('Sample employees (structured):', employeeData.slice(0, 3));
		
		// Mostrar validaciones
		console.log('\n=== VALIDATION LOG ===');
		console.log('Validating employee data...');
		let validCount = 0;
		let invalidCount = 0;
		
		// Re-validar para mostrar detalles
		for (let i = 2; i < jsonData.length; i++) {
			const row = jsonData[i] as any[];
			if (!row || row.length === 0) continue;
			
			const firstCell = row[0];
			if (typeof firstCell === 'string' && 
				(firstCell.includes('DESCUENTOS') || firstCell.includes('BANAMEX') || firstCell.includes('TOTAL'))) {
				break;
			}
			
			const codigo = row[1];
			const nombre = row[2];
			
			const codigoValido = codigo && (
				(typeof codigo === 'string' && /^\d+$/.test(codigo.trim())) ||
				(typeof codigo === 'number' && !isNaN(codigo))
			);
			
			const nombreValido = nombre && 
				typeof nombre === 'string' && 
				nombre.trim().length > 0;
			
			if (codigoValido && nombreValido) {
				validCount++;
				if (validCount <= 3) {
					console.log(`✅ Valid employee ${validCount}: Código="${codigo}", Nombre="${nombre}"`);
				}
			} else {
				invalidCount++;
				if (invalidCount <= 5) {
					console.log(`❌ Invalid row ${invalidCount}: Código="${codigo}" (valid: ${codigoValido}), Nombre="${nombre}" (valid: ${nombreValido})`);
				}
			}
		}
		
		console.log(`\nValidation Summary: ${validCount} valid, ${invalidCount} invalid rows`);
		
		// Mostrar la diferencia entre formato array y objeto
		console.log('\n=== FORMAT COMPARISON ===');
		console.log('Raw array format (first row):', jsonData[2]);
		console.log('Structured object format (first employee):', employeeData[0]);
		console.log('Accessing employee data:');
		if (employeeData.length > 0) {
			const firstEmp = employeeData[0];
			console.log(`  Código: ${firstEmp['Código']}`);
			console.log(`  Empleado: ${firstEmp['Empleado']}`);
			console.log(`  PUESTO: ${firstEmp['PUESTO']}`);
			console.log(`  AREA: ${firstEmp['AREA']}`);
			console.log(`  SUELDO 2025: ${firstEmp['SUELDO 2025']}`);
			// Mostrar algunas categorías
			categoryColumns.slice(0, 3).forEach(col => {
				console.log(`  ${col}: ${firstEmp[col]}`);
			});
		}
		
		// Usar transacción para importación completa
		const result = await db.transaction(async (tx) => {
			// 1. Limpiar datos existentes de la semana
			await tx.delete(incidencesTable).where(eq(incidencesTable.weekId, parseInt(weekId)));
			await tx.delete(employeesToWeeksTable).where(eq(employeesToWeeksTable.weekId, parseInt(weekId)));
			await tx.delete(categoriesToWeeksTable).where(eq(categoriesToWeeksTable.weekId, parseInt(weekId)));
			
			// 2. Crear/actualizar empleados
			const employeeIds = new Map<string, number>();
			for (const empData of employeeData) {
				const codigo = empData['Código'];
				const nombre = empData['Empleado'];
				const puesto = empData['PUESTO'] || 'Sin puesto';
				const area = empData['AREA'] || 'Sin área';
				const sueldo = parseExcelNumber(empData['SUELDO 2025']);
				
				// Buscar empleado existente por código
				const existingEmployee = await tx.query.employeesTable.findFirst({
					where: eq(employeesTable.codigo, codigo)
				});
				
				let employeeId: number;
				if (existingEmployee) {
					// Actualizar empleado existente
					await tx.update(employeesTable)
						.set({ 
							name: nombre, 
							puesto, 
							area, 
							salary: sueldo,
							cede: area // Usar area como cede por ahora
						})
						.where(eq(employeesTable.id, existingEmployee.id));
					employeeId = existingEmployee.id;
				} else {
					// Crear nuevo empleado
					const [newEmployee] = await tx.insert(employeesTable).values({
						codigo,
						name: nombre,
						puesto,
						area,
						salary: sueldo,
						cede: area // Usar area como cede por ahora
					}).returning();
					employeeId = newEmployee.id;
				}
				
				employeeIds.set(codigo, employeeId);
				
				// Agregar empleado a la semana
				await tx.insert(employeesToWeeksTable).values({
					employeeId,
					weekId: parseInt(weekId),
					salary: sueldo,
					puesto,
					area,
					cede: area
				});
			}
			
			// 3. Crear categorías dinámicamente
			const categoryIds = new Map<string, number>();
			for (const categoryName of categoryColumns) {
				// Buscar categoría existente
				const existingCategory = await tx.query.categoriesTable.findFirst({
					where: eq(categoriesTable.concept, categoryName)
				});
				
				let categoryId: number;
				if (existingCategory) {
					categoryId = existingCategory.id;
				} else {
					// Crear nueva categoría
					const [newCategory] = await tx.insert(categoriesTable).values({
						concept: categoryName,
						type: 'destajo', // Por defecto, se puede ajustar después
						unit: 'kg', // Por defecto, se puede ajustar después
						unitMonetaryValue: 1,
						unitValueIsDerived: false
					}).returning();
					categoryId = newCategory.id;
				}
				
				categoryIds.set(categoryName, categoryId);
				
				// Agregar categoría a la semana
				await tx.insert(categoriesToWeeksTable).values({
					categoryId,
					weekId: parseInt(weekId),
					concept: categoryName,
					type: 'destajo',
					unit: 'kg',
					unitMonetaryValue: 1,
					unitValueIsDerived: false
				});
			}
			
			// 4. Crear incidencias
			let incidencesCreated = 0;
			for (const empData of employeeData) {
				const codigo = empData['Código'];
				const employeeId = employeeIds.get(codigo);
				if (!employeeId) continue;
				
				for (const categoryName of categoryColumns) {
					const value = empData[categoryName];
					const parsedValue = parseExcelNumber(value);
					const categoryId = categoryIds.get(categoryName);
					if (categoryId) {
						await tx.insert(incidencesTable).values({
							employeeId,
							categoryId,
							weekId: parseInt(weekId),
							amount: parsedValue
						});
						incidencesCreated++;
					}
				}
			}
			
			return {
				employeesImported: employeeData.length,
				categoriesImported: categoryColumns.length,
				incidencesCreated
			};
		});
		
		console.log('=== EXCEL IMPORT COMPLETE ===');
		console.log('Result:', result);
		
		return json({ 
			success: true, 
			message: 'Excel imported successfully!',
			stats: {
				totalEmployees: result.employeesImported,
				totalCategories: result.categoriesImported,
				totalIncidences: result.incidencesCreated,
				weekId: parseInt(weekId)
			}
		});

	} catch (error) {
		console.error('Error importing Excel:', error);
		return json({ success: false, error: 'Error importing Excel file' }, { status: 500 });
	}
}