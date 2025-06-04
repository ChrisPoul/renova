import {
	getAllEmployeesWithIncidences,
	getAllIncidenceCategories,
	makeDummyData
} from '$lib/server/db/index';
import { db } from '$lib/server/db/index';
import {
	incidenceCategoriesTable,
	employeesTable,
	incidencesTable
} from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load() {
	let [employees, incidenceCategories] = await Promise.all([
		getAllEmployeesWithIncidences(),
		getAllIncidenceCategories()
	]);
	if (employees.length === 0 || incidenceCategories.length === 0) {
		await makeDummyData();
		// Re-fetch data after inserting dummy data
		[employees, incidenceCategories] = await Promise.all([
			getAllEmployeesWithIncidences(),
			getAllIncidenceCategories()
		]);
	}
	return { employees, incidenceCategories };
}

export const actions = {
	editCategory: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		const concept = form.get('concept') as string;
		const type = form.get('type') as string;
		const unit = form.get('unit') as string;
		const unitMonetaryValue = Number(form.get('unitMonetaryValue'));

		if (!id || !concept || !type || !unit || isNaN(unitMonetaryValue)) {
			return fail(400, { error: 'Todos los campos son obligatorios.' });
		}

		await db
			.update(incidenceCategoriesTable)
			.set({ concept, type, unit, unitMonetaryValue })
			.where(eq(incidenceCategoriesTable.id, id))
			.run();

		return { success: true };
	},
	deleteCategory: async ({ request }) => {
		const form = await request.formData();
		console.log('Deleting category');
		const id = Number(form.get('id'));
		if (!id) {
			return fail(400, { error: 'ID de categoría es obligatorio.' });
		}
		await db.delete(incidenceCategoriesTable).where(eq(incidenceCategoriesTable.id, id)).run();

		return { success: true };
	},
	addEmployee: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name') as string;
		const salary = Number(form.get('salary'));
		const puesto = form.get('puesto') as string;
		const area = form.get('area') as string;

		if (!name || !puesto || !area || isNaN(salary)) {
			return fail(400, { error: 'Todos los campos son obligatorios.' });
		}

		// Insert employee
		const result = await db
			.insert(employeesTable)
			.values({ name, salary, puesto, area })
			.returning({ id: employeesTable.id })
			.get();

		const newEmployeeId = result.id;

		// Create incidences for all categories for this employee
		const categories = await db.select().from(incidenceCategoriesTable).all();
		const newIncidences = categories.map((cat) => ({
			employee: newEmployeeId,
			category: cat.id,
			amount: 0
		}));
		if (newIncidences.length > 0) {
			await db.insert(incidencesTable).values(newIncidences).run();
		}

		return { success: true };
	}
};
