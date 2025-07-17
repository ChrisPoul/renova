import { db } from '$lib/server/db/index';
import {
	employeesTable,
	employeesToWeeksTable,
	incidenceCategoriesTable,
	incidencesTable,
	categoriesToWeeksTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function POST({ request }) {
	const body = await request.json();
	const { weekId, ...employeeData } = body;

	await db.transaction(async (tx) => {
		const [newEmployee] = await tx
			.insert(employeesTable)
			.values(employeeData)
			.returning({ id: employeesTable.id });

		const newEmployeeId = newEmployee.id;

		await tx.insert(employeesToWeeksTable).values({ employeeId: newEmployeeId, weekId });

		const categoriesInWeek = await tx
			.select({ id: categoriesToWeeksTable.categoryId })
			.from(categoriesToWeeksTable)
			.where(eq(categoriesToWeeksTable.weekId, weekId));

		const newIncidences = categoriesInWeek.map((cat) => ({
			employee: newEmployeeId,
			category: cat.id,
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

	if (!id || !changes) {
		return json({ error: 'Missing id or changes' }, { status: 400 });
	}

	await db.update(employeesTable).set(changes).where(eq(employeesTable.id, id)).run();

	return json({ success: true });
}

export async function DELETE({ request }) {
	const body = await request.json();
	const { id, weekId } = body;

	if (!id || !weekId) {
		return json({ error: 'ID de empleado y de semana son obligatorios.' }, { status: 400 });
	}

	await db.transaction(async (tx) => {
		await tx
			.delete(employeesToWeeksTable)
			.where(
				and(
					eq(employeesToWeeksTable.employeeId, id),
					eq(employeesToWeeksTable.weekId, weekId)
				)
			);

		await tx
			.delete(incidencesTable)
			.where(and(eq(incidencesTable.employee, id), eq(incidencesTable.weekId, weekId)));
	});

	return json({ success: true });
}
