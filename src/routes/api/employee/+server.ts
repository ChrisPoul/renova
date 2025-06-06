import { db } from '$lib/server/db/index';
import { employeesTable, incidenceCategoriesTable, incidencesTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

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

export async function PATCH({ request }) {
	const body = await request.json();
	const { id, changes } = body;

	if (!id || !changes) {
		return json({ error: 'Missing id or changes' }, { status: 400 });
	}

	await db.update(employeesTable).set(changes).where(eq(employeesTable.id, id)).run();

	return json({ success: true });
}

export async function DELETE({ request }) {
	const body = await request.json();
	const { id } = body;

	if (!id) {
		return json({ error: 'ID de empleado es obligatorio.' }, { status: 400 });
	}

	await db.delete(employeesTable).where(eq(employeesTable.id, id)).run();

	return json({ success: true });
}
