import { db } from '$lib/server/db';
import {
	employeesToWeeksTable,
	employeesTable,
	incidencesTable,
	categoriesToWeeksTable
} from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { EMPLOYEE_COLUMNS } from '$lib/constants';

export async function POST({ request }) {
	const body = await request.json();
	const { employeeIds, weekId } = body;

	const employees = await db.query.employeesTable.findMany({
		where: (employees, { inArray }) => inArray(employees.id, employeeIds)
	});

	if (!employees) {
		return json({ error: 'Employees not found' }, { status: 404 });
	}

	let newIncidences: Incidence[] = [];

	await db.transaction(async (tx) => {
		const employeesToInsert = employees.map((employee) => {
			// Create employee-to-week entry dynamically
			const employeeToWeekData = EMPLOYEE_COLUMNS.reduce((dataObject, field) => {
				if (field.key === 'name' || field.key === 'codigo') return dataObject; // Skip fields not in employeesToWeeksTable
				dataObject[field.key] = employee[field.key as keyof typeof employee];
				return dataObject;
			}, {
				employeeId: employee.id,
				weekId
			} as any);
			
			return employeeToWeekData;
		});
		await tx.insert(employeesToWeeksTable).values(employeesToInsert);

		const categoriesInWeek = await tx
			.select({ id: categoriesToWeeksTable.categoryId })
			.from(categoriesToWeeksTable)
			.where(eq(categoriesToWeeksTable.weekId, weekId));

		const newIncidencesData = employees.flatMap((employee) =>
			categoriesInWeek.map((cat) => ({
				employeeId: employee.id,
				categoryId: cat.id,
				amount: 0,
				weekId
			}))
		);

		if (newIncidencesData.length > 0) {
			newIncidences = await tx.insert(incidencesTable).values(newIncidencesData).returning();
		}
	});

	return json({ success: true, newIncidences, newEmployees: employees });
}

export async function PATCH({ request }) {
	const body = await request.json();
	const { employeeId, weekId, changes } = body;

	if (!employeeId || !weekId || !changes) {
		return json({ error: 'Missing employeeId, weekId, or changes' }, { status: 400 });
	}

	await db
		.update(employeesToWeeksTable)
		.set(changes)
		.where(
			and(
				eq(employeesToWeeksTable.employeeId, employeeId),
				eq(employeesToWeeksTable.weekId, weekId)
			)
		);

	return json({ success: true });
}

export async function DELETE({ request }) {
	const body = await request.json();
	const { employeeId, weekId } = body;

	if (!employeeId || !weekId) {
		return json({ error: 'ID de empleado y de semana son obligatorios.' }, { status: 400 });
	}

	await db.transaction(async (tx) => {
		await tx
			.delete(employeesToWeeksTable)
			.where(
				and(
					eq(employeesToWeeksTable.employeeId, employeeId),
					eq(employeesToWeeksTable.weekId, weekId)
				)
			);

		await tx
			.delete(incidencesTable)
			.where(and(eq(incidencesTable.employeeId, employeeId), eq(incidencesTable.weekId, weekId)));
	});

	return json({ success: true });
}
