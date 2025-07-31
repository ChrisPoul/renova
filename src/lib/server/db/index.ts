import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { getWeekFromDate } from '$lib/utils.js';

export const db = drizzle('file:local.db', { schema });

export async function makeDummyData() {
	const { startDate, endDate } = getWeekFromDate(new Date());
	const weeks = [{ id: 1, startDate: startDate, endDate: endDate }];
	const categories = [
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
		{ id: 1, employeeId: 1, categoryId: 1, amount: 100, weekId: 1 },
		{ id: 2, employeeId: 1, categoryId: 2, amount: 15, weekId: 1 },
		{ id: 3, employeeId: 1, categoryId: 3, amount: 50, weekId: 1 },
		{ id: 4, employeeId: 1, categoryId: 4, amount: 30, weekId: 1 },
		{ id: 5, employeeId: 1, categoryId: 5, amount: 10, weekId: 1 },
		{ id: 6, employeeId: 1, categoryId: 6, amount: 5, weekId: 1 },
		{ id: 13, employeeId: 1, categoryId: 7, amount: 2, weekId: 1 },
		{ id: 15, employeeId: 1, categoryId: 8, amount: 3, weekId: 1 },
		{ id: 7, employeeId: 2, categoryId: 1, amount: 200, weekId: 1 },
		{ id: 8, employeeId: 2, categoryId: 2, amount: 25, weekId: 1 },
		{ id: 9, employeeId: 2, categoryId: 3, amount: 60, weekId: 1 },
		{ id: 10, employeeId: 2, categoryId: 4, amount: 40, weekId: 1 },
		{ id: 11, employeeId: 2, categoryId: 5, amount: 20, weekId: 1 },
		{ id: 12, employeeId: 2, categoryId: 6, amount: 10, weekId: 1 },
		{ id: 14, employeeId: 2, categoryId: 7, amount: 3, weekId: 1 },
		{ id: 16, employeeId: 2, categoryId: 8, amount: 4, weekId: 1 }
	];

	const employeesToWeeks = [
		{ employeeId: 1, weekId: 1 },
		{ employeeId: 2, weekId: 1 }
	];

	const categoriesToWeeks = [
		{ categoryId: 1, weekId: 1 },
		{ categoryId: 2, weekId: 1 },
		{ categoryId: 3, weekId: 1 },
		{ categoryId: 4, weekId: 1 },
		{ categoryId: 5, weekId: 1 },
		{ categoryId: 6, weekId: 1 },
		{ categoryId: 7, weekId: 1 },
		{ categoryId: 8, weekId: 1 }
	];

	await db.insert(schema.weeksTable).values(weeks).run();
	await db.insert(schema.categoriesTable).values(categories).run();
	await db.insert(schema.employeesTable).values(employees).run();
	await db.insert(schema.incidencesTable).values(incidences).run();
	await db.insert(schema.employeesToWeeksTable).values(employeesToWeeks).run();
	await db.insert(schema.categoriesToWeeksTable).values(categoriesToWeeks).run();

	console.log('Dummy data inserted successfully');
}
