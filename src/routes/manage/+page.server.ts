import { db } from '$lib/server/db';
import { employeesTable, categoriesTable } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async () => {
	const employees = await db.select().from(employeesTable);
	const categories = await db.select().from(categoriesTable);
	return { employees, categories };
};

export const actions = {
	deleteEmployee: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);

		if (!id) {
			return fail(400, { message: 'Invalid ID' });
		}

		await db.delete(employeesTable).where(eq(employeesTable.id, id));

		return { success: true };
	},
	deleteCategory: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);

		if (!id) {
			return fail(400, { message: 'Invalid ID' });
		}

		await db.delete(categoriesTable).where(eq(categoriesTable.id, id));

		return { success: true };
	}
};