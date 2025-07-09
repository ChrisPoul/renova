import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

export const db = drizzle('file:local.db', { schema });

// Get all incidence categories
export async function getAllIncidenceCategories(weekId: string | null) {
	const where = weekId ? eq(schema.incidencesTable.weekId, +weekId) : undefined;
	return db.query.incidenceCategoriesTable.findMany({
		orderBy: (table, { desc }) => [desc(table.type)],
		where
	});
}

export async function getAllEmployeesWithIncidences(weekId: string | null) {
	const where = weekId ? eq(schema.incidencesTable.weekId, +weekId) : undefined;
	return db.query.employeesTable.findMany({
		with: {
			incidencias: {
				where
			}
		}
	});
}

export async function updateIncidenceCategory(categoryID: number, data) {
	await db
		.update(schema.incidenceCategoriesTable)
		.set(data)
		.where(eq(schema.incidenceCategoriesTable.id, categoryID))
		.run();
}

export async function makeDummyData() {
	// --- Dummy Data ---
	const weeks = [
		{ id: 1, startDate: new Date('2024-07-01'), endDate: new Date('2024-07-07') },
		{ id: 2, startDate: new Date('2024-07-08'), endDate: new Date('2024-07-14') }
	];
	const incidenceCategories = [
		{ id: 1, concept: 'Puertas Muy Grandes', type: 'destajo', unit: 'u', unitMonetaryValue: 12 },
		{ id: 2, concept: 'Corte Junke', type: 'destajo', unit: 'kg', unitMonetaryValue: 20 },
		{ id: 3, concept: 'Corte Chapa', type: 'destajo', unit: 'kg', unitMonetaryValue: 15 },
		{ id: 4, concept: 'Corte Aluminio', type: 'destajo', unit: 'kg', unitMonetaryValue: 10 },
		{ id: 5, concept: 'Corte Vidrio', type: 'destajo', unit: 'kg', unitMonetaryValue: 5 },
		{ id: 6, concept: 'Bono Productividad', type: 'bono', unit: '', unitMonetaryValue: 1 },
		{ id: 8, concept: 'Tiempo Extra', type: 'bono', unit: 'horas', unitMonetaryValue: 0 },
		{ id: 7, concept: 'Días de Destajo', type: 'deduccion', unit: 'días', unitMonetaryValue: 0 }
	];
	const employees = [
		{ id: 1, name: 'John Doe de la crem', salary: 1000, puesto: 'Operador', area: 'Producción' },
		{ id: 2, name: 'Jane Smith', salary: 1200, puesto: 'Supervisor', area: 'Producción' }
	];
	const incidences = [
		{ id: 1, employee: 1, category: 1, amount: 100, weekId: 1 },
		{ id: 2, employee: 1, category: 2, amount: 15, weekId: 1 },
		{ id: 3, employee: 1, category: 3, amount: 50, weekId: 1 },
		{ id: 4, employee: 1, category: 4, amount: 30, weekId: 1 },
		{ id: 5, employee: 1, category: 5, amount: 10, weekId: 1 },
		{ id: 6, employee: 1, category: 6, amount: 5, weekId: 1 },
		{ id: 13, employee: 1, category: 7, amount: 2, weekId: 1 },
		{ id: 15, employee: 1, category: 8, amount: 3, weekId: 1 },
		{ id: 7, employee: 2, category: 1, amount: 200, weekId: 2 },
		{ id: 8, employee: 2, category: 2, amount: 25, weekId: 2 },
		{ id: 9, employee: 2, category: 3, amount: 60, weekId: 2 },
		{ id: 10, employee: 2, category: 4, amount: 40, weekId: 2 },
		{ id: 11, employee: 2, category: 5, amount: 20, weekId: 2 },
		{ id: 12, employee: 2, category: 6, amount: 10, weekId: 2 },
		{ id: 14, employee: 2, category: 7, amount: 3, weekId: 2 },
		{ id: 16, employee: 2, category: 8, amount: 4, weekId: 2 }
	];

	const employeesToWeeks = [
		{ employeeId: 1, weekId: 1 },
		{ employeeId: 2, weekId: 1 },
		{ employeeId: 1, weekId: 2 },
		{ employeeId: 2, weekId: 2 }
	];

	const categoriesToWeeks = [
		{ categoryId: 1, weekId: 1 },
		{ categoryId: 2, weekId: 1 },
		{ categoryId: 3, weekId: 1 },
		{ categoryId: 4, weekId: 1 },
		{ categoryId: 5, weekId: 1 },
		{ categoryId: 6, weekId: 1 },
		{ categoryId: 7, weekId: 1 },
		{ categoryId: 8, weekId: 1 },
		{ categoryId: 1, weekId: 2 },
		{ categoryId: 2, weekId: 2 },
		{ categoryId: 3, weekId: 2 },
		{ categoryId: 4, weekId: 2 },
		{ categoryId: 5, weekId: 2 },
		{ categoryId: 6, weekId: 2 },
		{ categoryId: 7, weekId: 2 },
		{ categoryId: 8, weekId: 2 }
	];

	await db.insert(schema.weeksTable).values(weeks).run();
	await db.insert(schema.incidenceCategoriesTable).values(incidenceCategories).run();
	await db.insert(schema.employeesTable).values(employees).run();
	await db.insert(schema.incidencesTable).values(incidences).run();
	await db.insert(schema.employeesToWeeksTable).values(employeesToWeeks).run();
	await db.insert(schema.categoriesToWeeksTable).values(categoriesToWeeks).run();

	console.log('Dummy data inserted successfully');
}
