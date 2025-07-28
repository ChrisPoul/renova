import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { employeesToWeeksTable, incidencesTable, categoriesToWeeksTable, employeesTable } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function POST({ request }) {
	const { employeeIds, weekId }: { employeeIds: number[]; weekId: number } = await request.json();

	// 1. Create links in employeesToWeeksTable
	const valuesToInsert = employeeIds.map((employeeId) => ({
		employeeId,
		weekId
	}));
	await db.insert(employeesToWeeksTable).values(valuesToInsert);

	// 2. Get all categories for the week
	const categoriesForWeek = await db.query.categoriesToWeeksTable.findMany({
		where: eq(categoriesToWeeksTable.weekId, weekId),
		columns: {
			categoryId: true
		}
	});
	const categoryIds = categoriesForWeek.map((c) => c.categoryId);

	// 3. For each employee, create default incidences for each category
	const newIncidencesData: (typeof incidencesTable.$inferInsert)[] = [];
	for (const employeeId of employeeIds) {
		for (const categoryId of categoryIds) {
			newIncidencesData.push({
				employeeId,
				categoryId,
				weekId,
				amount: 0 // Default amount
			});
		}
	}
	let newIncidences: Incidence[] = [];
	if (newIncidencesData.length > 0) {
		newIncidences = await db.insert(incidencesTable).values(newIncidencesData).returning();
	}
	console.log("Incidences created:", newIncidences.length);

	// 4. Fetch the full employee objects
	const newEmployees = await db.query.employeesTable.findMany({
		where: inArray(employeesTable.id, employeeIds)
	});

	// 5. Return employees and their newly created incidences
	return json({ newEmployees, newIncidences });
}
