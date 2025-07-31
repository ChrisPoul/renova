import { db } from '$lib/server/db';
import {
	weeksTable,
	categoriesTable,
	categoriesToWeeksTable,
	employeesTable,
	incidencesTable,
	employeesToWeeksTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { getWeekFromDate } from '$lib/utils.js';

export async function POST({ request }) {
	const { date } = await request.json();

	const { startDate, endDate } = getWeekFromDate(date);

	const existingWeek = await db
		.select()
		.from(weeksTable)
		.where(eq(weeksTable.startDate, startDate));

	if (existingWeek.length > 0) {
		return json({ weekId: existingWeek[0].id });
	}

	const newWeek = await db.transaction(async (tx) => {
		const [newWeek] = await tx.insert(weeksTable).values({ startDate, endDate }).returning();

		const allCategories = await tx.select({ id: categoriesTable.id }).from(categoriesTable);
		const allEmployees = await tx.select({ id: employeesTable.id }).from(employeesTable);

		if (allCategories.length > 0) {
			const categoriesToInsert = allCategories.map((category) => ({
				categoryId: category.id,
				weekId: newWeek.id
			}));
			await tx.insert(categoriesToWeeksTable).values(categoriesToInsert);
		}

		if (allEmployees.length > 0) {
			const employeesToInsert = allEmployees.map((employee) => ({
				employeeId: employee.id,
				weekId: newWeek.id
			}));
			await tx.insert(employeesToWeeksTable).values(employeesToInsert);
		}

		if (allEmployees.length > 0 && allCategories.length > 0) {
			const incidencesToInsert = allEmployees.flatMap((employee) =>
				allCategories.map((category) => ({
					employeeId: employee.id,
					categoryId: category.id,
					weekId: newWeek.id,
					amount: 0 // Default amount
				}))
			);
			await tx.insert(incidencesTable).values(incidencesToInsert);
		}

		return newWeek;
	});

	return json({ weekId: newWeek.id });
}
