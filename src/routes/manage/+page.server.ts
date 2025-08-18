import { db } from '$lib/server/db';
import { employeesTable, categoriesTable } from '$lib/server/db/schema';
import type { Actions } from './$types';
import { eq } from 'drizzle-orm';

export const load = async () => {
	const employees = await db.select().from(employeesTable);
	const categories = await db.select().from(categoriesTable);
	return { employees, categories };
};

export const actions: Actions = {
	registerEmployee: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const salary = parseFloat(data.get('salary') as string);
		const puesto = data.get('puesto') as string;
		const area = data.get('area') as string;

		await db.insert(employeesTable).values({ name, salary, puesto, area });

		return { success: true };
	},
	editEmployee: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);
		const name = data.get('name') as string;
		const salary = parseFloat(data.get('salary') as string);
		const puesto = data.get('puesto') as string;
		const area = data.get('area') as string;

		await db.update(employeesTable).set({ name, salary, puesto, area }).where(eq(employeesTable.id, id));

		return { success: true };
	},
	deleteEmployee: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);

		await db.delete(employeesTable).where(eq(employeesTable.id, id));

		return { success: true };
	}
};
