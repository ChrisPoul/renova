import {
	getAllEmployeesWithIncidences,
	getAllIncidenceCategories,
	makeDummyData
} from '$lib/server/db/index';
import { db } from '$lib/server/db/index';
import { incidenceCategoriesTable } from '$lib/server/db/schema';
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
	addCategory: async ({ request }) => {
		console.log('Adding new category');
		const form = await request.formData();
		const concept = form.get('concept') as string;
		const type = form.get('type') as string;
		const unit = form.get('unit') as string;
		const unitMonetaryValue = Number(form.get('unitMonetaryValue'));

		if (!concept || !type || !unit || isNaN(unitMonetaryValue)) {
			return fail(400, { error: 'Todos los campos son obligatorios.' });
		}

		await db
			.insert(incidenceCategoriesTable)
			.values({
				concept,
				type,
				unit,
				unitMonetaryValue
			})
			.run();

		// Optionally redirect or return success
		console.log('Category added successfully');
		return { success: true };
	},
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
    console.log("Deleting category");
    const id = Number(form.get('id'));
    if (!id) {
      return fail(400, { error: 'ID de categoría es obligatorio.' });
    }
    await db
      .delete(incidenceCategoriesTable)
      .where(eq(incidenceCategoriesTable.id, id))
      .run();

    return { success: true };
  }
};
