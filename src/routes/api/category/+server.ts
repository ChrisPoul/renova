import { db } from '$lib/server/db/index';
import {
	categoriesToWeeksTable,
	employeesTable,
	categoriesTable,
	incidencesTable,
	employeesToWeeksTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function POST({ request }) {
	const body = await request.json();
	const { weekId, ...categoryData } = body;

	if (!weekId) {
		const [newCategory] = await db.insert(categoriesTable).values(categoryData).returning();
		return json({ category: newCategory });
	}

	let category;
	let incidences: Incidence[] = [];

	await db.transaction(async (tx) => {
		const [newCategory] = await tx.insert(categoriesTable).values(categoryData).returning();
		category = newCategory;

		await tx.insert(categoriesToWeeksTable).values({
			categoryId: category.id,
			weekId,
			concept: category.concept,
			type: category.type,
			unit: category.unit,
			unitMonetaryValue: category.unitMonetaryValue,
			unitValueIsDerived: category.unitValueIsDerived
		});

		const employeesInWeek = await tx
			.select()
			.from(employeesToWeeksTable)
			.where(eq(employeesToWeeksTable.weekId, weekId));

		const newIncidences = employeesInWeek.map((emp) => ({
			employeeId: emp.employeeId,
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
	const { categoryId } = body;

	if (!categoryId) {
		return json({ error: 'ID de categoría es obligatorio.' }, { status: 400 });
	}

	await db.delete(categoriesTable).where(eq(categoriesTable.id, categoryId));
	return json({ success: true });
}
