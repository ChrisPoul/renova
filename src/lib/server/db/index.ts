import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export const db = drizzle('file:local.db', { schema });

// Get all incidence categories
export async function getAllIncidenceCategories() {
	return db.query.incidenceCategories.findMany();
}

export async function getAllEmployeesWithIncidences() {
	return db.query.employees.findMany({
		with: {
			incidencias: true
		}
	});
}

export async function makeDummyData() {
	// --- Dummy Data ---
	const incidenceCategories = [
		{ id: 1, concept: 'Puertas Muy Grandes', type: 'destajo', unit: 'u', unitMonetaryValue: 12 },
		{ id: 2, concept: 'Corte Junke', type: 'destajo', unit: 'kg', unitMonetaryValue: 20 },
		{ id: 3, concept: 'Corte Chapa', type: 'destajo', unit: 'kg', unitMonetaryValue: 15 },
		{ id: 4, concept: 'Corte Aluminio', type: 'destajo', unit: 'kg', unitMonetaryValue: 10 },
		{ id: 5, concept: 'Corte Vidrio', type: 'destajo', unit: 'kg', unitMonetaryValue: 5 },
		{ id: 6, concept: 'Bono Productividad', type: 'bono', unit: '$', unitMonetaryValue: 1 },
		{ id: 8, concept: 'Tiempo Extra', type: 'bono', unit: 'horas', unitMonetaryValue: 0 },
		{ id: 7, concept: 'Días de Destajo', type: 'deduccion', unit: 'días', unitMonetaryValue: 0 }
	];
	const employees = [
		{ id: 1, name: 'John Doe de la crem', salary: 1000, puesto: 'Operador', area: 'Producción' },
		{ id: 2, name: 'Jane Smith', salary: 1200, puesto: 'Supervisor', area: 'Producción' }
	];
	const incidencias = [
		{ id: 1, employee: 1, category: 1, amount: 100 },
		{ id: 2, employee: 1, category: 2, amount: 15 },
		{ id: 3, employee: 1, category: 3, amount: 50 },
		{ id: 4, employee: 1, category: 4, amount: 30 },
		{ id: 5, employee: 1, category: 5, amount: 10 },
		{ id: 6, employee: 1, category: 6, amount: 5 },
		{ id: 13, employee: 1, category: 7, amount: 2 },
		{ id: 15, employee: 1, category: 8, amount: 3 },
		{ id: 7, employee: 2, category: 1, amount: 200 },
		{ id: 8, employee: 2, category: 2, amount: 25 },
		{ id: 9, employee: 2, category: 3, amount: 60 },
		{ id: 10, employee: 2, category: 4, amount: 40 },
		{ id: 11, employee: 2, category: 5, amount: 20 },
		{ id: 12, employee: 2, category: 6, amount: 10 },
		{ id: 14, employee: 2, category: 7, amount: 3 },
		{ id: 16, employee: 2, category: 8, amount: 4 }
	];

	await db.insert(schema.incidenceCategories).values(incidenceCategories).run();
	await db.insert(schema.employees).values(employees).run();
	await db.insert(schema.incidences).values(incidencias).run();
  console.log('Dummy data inserted successfully');
}
