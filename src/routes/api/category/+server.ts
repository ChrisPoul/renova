import { db } from '$lib/server/db/index';
import {
	categoriesToWeeksTable,
	employeesTable,
	categoriesTable,
	incidencesTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function POST({ request }) {
	const body = await request.json();
	const { weekId, ...categoryData } = body;
	let category;
	let incidences;

	await db.transaction(async (tx) => {
		const [newCategory] = await tx.insert(categoriesTable).values(categoryData).returning();
		category = newCategory;

		await tx.insert(categoriesToWeeksTable).values({ categoryId: newCategory.id, weekId });

		const employees = await tx.select().from(employeesTable);

		const newIncidences = employees.map((emp) => ({
			employeeId: emp.id,
			categoryId: newCategory.id,
			weekId
		}));

		if (newIncidences.length > 0) {
			incidences = await tx.insert(incidencesTable).values(newIncidences).returning();
		}
	});
	console.log(incidences);

	return json({ category, incidences });
}

export async function PATCH({ request }) {
	const body = await request.json();

	const { id, changes } = body;
	await db.update(categoriesTable).set(changes).where(eq(categoriesTable.id, id)).run();

	return json({ success: true });
}

export async function DELETE({ request }) {
	const body = await request.json();
	const { id, weekId } = body;

	if (!id || !weekId) {
		return json({ error: 'ID de categoría y de semana son obligatorios.' }, { status: 400 });
	}

	await db.transaction(async (tx) => {
		await tx
			.delete(categoriesToWeeksTable)
			.where(
				and(eq(categoriesToWeeksTable.categoryId, id), eq(categoriesToWeeksTable.weekId, weekId))
			);

		await tx
			.delete(incidencesTable)
			.where(and(eq(incidencesTable.categoryId, id), eq(incidencesTable.weekId, weekId)));
	});

	return json({ success: true });
}
