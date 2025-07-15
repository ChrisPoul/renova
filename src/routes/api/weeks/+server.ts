import { db } from '$lib/server/db';
import {
	weeksTable,
	incidenceCategoriesTable,
	categoriesToWeeksTable,
	employeesTable,
	incidencesTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function GET() {
	const weeks = await db.select().from(weeksTable);
	return json(weeks);
}

export async function POST({ request }) {
	const { week } = await request.json();
	const [year, weekNumber] = week.split('-W').map(Number);
	const date = new Date(year, 0, 1 + (weekNumber - 1) * 7);
	date.setDate(date.getDate() + (1 - date.getDay()));
	const startDate = new Date(date);
	const endDate = new Date(date);
	endDate.setDate(endDate.getDate() + 6);

	const existingWeek = await db
		.select()
		.from(weeksTable)
		.where(eq(weeksTable.startDate, startDate));

	if (existingWeek.length > 0) {
		return json({ weekId: existingWeek[0].id });
	}

	const newWeek = await db.transaction(async (tx) => {
		const [newWeek] = await tx.insert(weeksTable).values({ startDate, endDate }).returning();

		const allCategories = await tx.select({ id: incidenceCategoriesTable.id }).from(incidenceCategoriesTable);
		const allEmployees = await tx.select({ id: employeesTable.id }).from(employeesTable);

		if (allCategories.length > 0) {
			const categoriesToInsert = allCategories.map((category) => ({
				categoryId: category.id,
				weekId: newWeek.id
			}));
			await tx.insert(categoriesToWeeksTable).values(categoriesToInsert);
		}

		if (allEmployees.length > 0 && allCategories.length > 0) {
			const incidencesToInsert = allEmployees.flatMap((employee) =>
				allCategories.map((category) => ({
					employee: employee.id,
					category: category.id,
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
