import { db } from '$lib/server/db/index';
import {
	employeesTable,
	employeesToWeeksTable,
	incidencesTable,
	categoriesToWeeksTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function POST({ request }) {
	const body = await request.json();
	const { weekId, ...employeeData } = body;

	if (!weekId) {
		const [newEmployee] = await db.insert(employeesTable).values(employeeData).returning();
		return json({ employee: newEmployee });
	}

	let employee;
	let incidences: Incidence[] = [];

	await db.transaction(async (tx) => {
		const [newEmployee] = await tx.insert(employeesTable).values(employeeData).returning();
		employee = newEmployee;

		const newEmployeeId = newEmployee.id;

		await tx.insert(employeesToWeeksTable).values({
			employeeId: employee.id,
			weekId,
			salary: employee.salary,
			puesto: employee.puesto,
			area: employee.area
		});

		const categoriesInWeek = await tx
			.select({ id: categoriesToWeeksTable.categoryId })
			.from(categoriesToWeeksTable)
			.where(eq(categoriesToWeeksTable.weekId, weekId));

		const newIncidences = categoriesInWeek.map((cat) => ({
			employeeId: newEmployeeId,
			categoryId: cat.id,
			amount: 0,
			weekId
		}));

		if (newIncidences.length > 0) {
			incidences = await tx.insert(incidencesTable).values(newIncidences).returning();
		}
	});

	return json({ employee, incidences });
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
	const { employeeId } = body;

	if (!employeeId) {
		return json({ error: 'ID de empleado es obligatorio.' }, { status: 400 });
	}

	await db.delete(employeesTable).where(eq(employeesTable.id, employeeId));
	return json({ success: true });
}
