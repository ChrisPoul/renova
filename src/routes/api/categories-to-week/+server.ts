import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categoriesToWeeksTable, incidencesTable, employeesToWeeksTable, categoriesTable } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function POST({ request }: RequestEvent) {
	const { categoryIds, weekId }: { categoryIds: number[]; weekId: number } = await request.json();

	// 1. Create links in categoriesToWeeksTable
	const valuesToInsert = categoryIds.map((categoryId) => ({
		categoryId,
		weekId
	}));
	await db.insert(categoriesToWeeksTable).values(valuesToInsert);

	// 2. Get all employees for the week
	const employeesForWeek = await db.query.employeesToWeeksTable.findMany({
		where: eq(employeesToWeeksTable.weekId, weekId),
		columns: {
			employeeId: true
		}
	});
	const employeeIds = employeesForWeek.map((e) => e.employeeId);

	// 3. For each category, create default incidences for each employee
	const newIncidencesData: (typeof incidencesTable.$inferInsert)[] = [];
	for (const categoryId of categoryIds) {
		for (const employeeId of employeeIds) {
			newIncidencesData.push({
				categoryId,
				employeeId,
				weekId,
				amount: 0 // Default amount
			});
		}
	}
	let newIncidences: (typeof incidencesTable.$inferSelect)[] = [];
	if (newIncidencesData.length > 0) {
		newIncidences = await db.insert(incidencesTable).values(newIncidencesData).returning();
	}

	// 4. Fetch the full category objects
	const categories = await db.query.categoriesTable.findMany({
		where: inArray(categoriesTable.id, categoryIds)
	});
	console.log("Incidences created:", newIncidences.length);

	// 5. Return categories and their newly created incidences
	return json({ categories, incidences: newIncidences });
}
