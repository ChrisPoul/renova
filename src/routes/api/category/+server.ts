import { db } from '$lib/server/db/index';
import { employeesTable, incidenceCategoriesTable, incidencesTable } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
  const body = await request.json();

	const result = await db
		.insert(incidenceCategoriesTable)
		.values(body)
		.returning({ id: incidenceCategoriesTable.id })
		.get();

	const newCategoryId = result.id;
	const employees = await db.select().from(employeesTable).all();

	const newIncidences = employees.map((emp) => ({
		employee: emp.id,
		category: newCategoryId,
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
  await db
    .update(incidenceCategoriesTable)
    .set(changes)
    .where(eq(incidenceCategoriesTable.id, id))
    .run();

	return json({ success: true });
}

export async function DELETE({ request }) {
	const body = await request.json();
	const { id } = body;

	if (!id) {
		return json({ error: 'ID de categoría es obligatorio.' }, { status: 400 });
	}

	await db.delete(incidenceCategoriesTable).where(eq(incidenceCategoriesTable.id,id)).run();

	return json({ success: true });
}
