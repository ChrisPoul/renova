import { db } from '$lib/server/db/index';
import { employeesTable, incidenceCategoriesTable, incidencesTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const body = await request.json();

	const result = await db
		.insert(employeesTable)
		.values(body)
		.returning({ id: employeesTable.id })
		.get();

	const newEmployeeId = result.id;

	// Get all categories
	const categories = await db.select().from(incidenceCategoriesTable).all();

	// Create an incidence for each category for the new employee
	const newIncidences = categories.map((cat) => ({
		employee: newEmployeeId,
		category: cat.id,
		amount: 0
	}));

	if (newIncidences.length > 0) {
		await db.insert(incidencesTable).values(newIncidences).run();
	}

	return json({ success: true });
}
