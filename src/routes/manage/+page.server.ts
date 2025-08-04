import { db } from '$lib/server/db';
import { employeesTable, categoriesTable } from '$lib/server/db/schema';

export const load = async () => {
	const employees = await db.select().from(employeesTable);
	const categories = await db.select().from(categoriesTable);
	return { employees, categories };
};
