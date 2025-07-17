import { db } from '$lib/server/db/index';
import {
	categoriesToWeeksTable,
	employeesTable,
	incidenceCategoriesTable,
	incidencesTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function POST({ request }) {
	const body = await request.json();
	const { weekId, ...categoryData } = body;

	await db.transaction(async (tx) => {
		const [newCategory] = await tx
			.insert(incidenceCategoriesTable)
			.values(categoryData)
			.returning({ id: incidenceCategoriesTable.id });

		const newCategoryId = newCategory.id;

		await tx.insert(categoriesToWeeksTable).values({ categoryId: newCategoryId, weekId });

		const employees = await tx.select().from(employeesTable);

		const newIncidences = employees.map((emp) => ({
			employee: emp.id,
			category: newCategoryId,
			amount: 0,
			weekId
		}));

		if (newIncidences.length > 0) {
			await tx.insert(incidencesTable).values(newIncidences);
		}
	});

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
	const { id, weekId } = body;

	if (!id || !weekId) {
		return json({ error: 'ID de categoría y de semana son obligatorios.' }, { status: 400 });
	}

	await db.transaction(async (tx) => {
		await tx
			.delete(categoriesToWeeksTable)
			.where(
				and(
					eq(categoriesToWeeksTable.categoryId, id),
					eq(categoriesToWeeksTable.weekId, weekId)
				)
			);

		await tx
			.delete(incidencesTable)
			.where(and(eq(incidencesTable.category, id), eq(incidencesTable.weekId, weekId)));
	});

	return json({ success: true });
}
