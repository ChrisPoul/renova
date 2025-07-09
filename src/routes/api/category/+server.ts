import { db } from '$lib/server/db/index';
import {
	categoriesToWeeksTable,
	employeesTable,
	incidenceCategoriesTable,
	incidencesTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	const body = await request.json();
	const { weekId, ...categoryData } = body;

	const result = await db
		.insert(incidenceCategoriesTable)
		.values(categoryData)
		.returning({ id: incidenceCategoriesTable.id })
		.get();

	const newCategoryId = result.id;
	const employees = await db.select().from(employeesTable).all();

	const newIncidences = employees.map((emp) => ({
		employee: emp.id,
		category: newCategoryId,
		amount: 0,
		weekId
	}));

	if (newIncidences.length > 0) {
		await db.insert(incidencesTable).values(newIncidences).run();
	}

	await db.insert(categoriesToWeeksTable).values({ categoryId: newCategoryId, weekId });

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

	await db.delete(incidenceCategoriesTable).where(eq(incidenceCategoriesTable.id, id)).run();

	return json({ success: true });
}
