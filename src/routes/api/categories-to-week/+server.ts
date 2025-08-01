import { db } from '$lib/server/db';
import {
	categoriesToWeeksTable,
	categoriesTable,
	incidencesTable,
	employeesToWeeksTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function POST({ request }) {
	const body = await request.json();
	const { categoryIds, weekId } = body;

	const categories = await db.query.categoriesTable.findMany({
		where: (categories, { inArray }) => inArray(categories.id, categoryIds)
	});

	if (!categories) {
		return json({ error: 'Categories not found' }, { status: 404 });
	}

	let incidences: Incidence[] = [];

	await db.transaction(async (tx) => {
		const categoriesToInsert = categories.map((category) => ({
			categoryId: category.id,
			weekId,
			concept: category.concept,
			type: category.type,
			unit: category.unit,
			unitMonetaryValue: category.unitMonetaryValue,
			unitValueIsDerived: category.unitValueIsDerived
		}));
		await tx.insert(categoriesToWeeksTable).values(categoriesToInsert);

		const employeesInWeek = await tx
			.select({ id: employeesToWeeksTable.employeeId })
			.from(employeesToWeeksTable)
			.where(eq(employeesToWeeksTable.weekId, weekId));

		const newIncidences = categories.flatMap((category) =>
			employeesInWeek.map((emp) => ({
				employeeId: emp.id,
				categoryId: category.id,
				amount: 0,
				weekId
			}))
		);

		if (newIncidences.length > 0) {
			incidences = await tx.insert(incidencesTable).values(newIncidences).returning();
		}
	});

	return json({ success: true, incidences, categories });
}

export async function PATCH({ request }) {
	const body = await request.json();
	const { categoryId, weekId, changes } = body;

	if (!categoryId || !weekId || !changes) {
		return json({ error: 'Missing categoryId, weekId, or changes' }, { status: 400 });
	}

	await db
		.update(categoriesToWeeksTable)
		.set(changes)
		.where(
			and(
				eq(categoriesToWeeksTable.categoryId, categoryId),
				eq(categoriesToWeeksTable.weekId, weekId)
			)
		);

	return json({ success: true });
}

export async function DELETE({ request }) {
	const body = await request.json();
	const { categoryId, weekId } = body;

	if (!categoryId || !weekId) {
		return json({ error: 'ID de categoría y de semana son obligatorios.' }, { status: 400 });
	}

	await db.transaction(async (tx) => {
		await tx
			.delete(categoriesToWeeksTable)
			.where(
				and(
					eq(categoriesToWeeksTable.categoryId, categoryId),
					eq(categoriesToWeeksTable.weekId, weekId)
				)
			);

		await tx
			.delete(incidencesTable)
			.where(and(eq(incidencesTable.categoryId, categoryId), eq(incidencesTable.weekId, weekId)));
	});

	return json({ success: true });
}
