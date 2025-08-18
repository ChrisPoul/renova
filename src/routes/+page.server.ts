import { db } from '$lib/server/db';
import { weeksTable, employeesTable, employeesToWeeksTable, categoriesToWeeksTable, incidencesTable } from '$lib/server/db/schema';
import type { IncidenceCells } from '$lib/stores.svelte.js';
import { getInitiatedIncidenceCells } from '$lib/utils.js';
import { eq, and } from 'drizzle-orm';
import type { Actions } from './$types';

export async function load({ url, fetch }) {
	let weekId: string | null = url.searchParams.get('weekId');
	let incidenceCells: IncidenceCells = new Map();
	let employees: Employees = new Map();
	let categories: Categories = new Map();

	if (!weekId) {
		const today = new Date();
		const res = await fetch('/api/weeks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ date: today.toISOString().split('T')[0] })
		});
		const { weekId: newWeekId } = await res.json();
		weekId = newWeekId;
	}
	const week = await db.query.weeksTable.findFirst({
		where: eq(weeksTable.id, +weekId!),
		with: {
			incidences: true,
			employeesToWeeks: {
				with: {
					employee: true
				}
			},
			categoriesToWeeks: {
				with: {
					category: true
				}
			}
		}
	});
	if (!week) {
		return { employees, categories, incidenceCells, week: null };
	}
	employees = new Map(
		week.employeesToWeeks.map((etw) => [
			etw.employeeId,
			{ ...etw, name: etw.employee.name, id: etw.employeeId }
		])
	);
	categories = new Map(
		week.categoriesToWeeks.map((ctw) => [
			ctw.categoryId,
			{ ...ctw, concept: ctw.category.concept, id: ctw.categoryId }
		])
	);
	incidenceCells = getInitiatedIncidenceCells(employees, categories, week.incidences);
	return {
		employees,
		categories,
		incidenceCells,
		week
	};
}

export const actions: Actions = {
	registerEmployee: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const salary = parseFloat(data.get('salary') as string);
		const puesto = data.get('puesto') as string;
		const area = data.get('area') as string;
		const weekId = parseInt(data.get('weekId') as string);

		await db.transaction(async (tx) => {
			const [newEmployee] = await tx.insert(employeesTable).values({ name, salary, puesto, area }).returning();

			await tx.insert(employeesToWeeksTable).values({
				employeeId: newEmployee.id,
				weekId,
				salary: newEmployee.salary,
				puesto: newEmployee.puesto,
				area: newEmployee.area
			});

			const categoriesInWeek = await tx
				.select({ id: categoriesToWeeksTable.categoryId })
				.from(categoriesToWeeksTable)
				.where(eq(categoriesToWeeksTable.weekId, weekId));

			const newIncidences = categoriesInWeek.map((cat) => ({
				employeeId: newEmployee.id,
				categoryId: cat.id,
				amount: 0,
				weekId
			}));

			if (newIncidences.length > 0) {
				await tx.insert(incidencesTable).values(newIncidences).returning();
			}
		});

		return { success: true };
	},
	editEmployee: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);
		const weekId = parseInt(data.get('weekId') as string);
		const name = data.get('name') as string;
		const salary = parseFloat(data.get('salary') as string);
		const puesto = data.get('puesto') as string;
		const area = data.get('area') as string;

		await db.update(employeesToWeeksTable).set({ salary, puesto, area }).where(and(eq(employeesToWeeksTable.employeeId, id), eq(employeesToWeeksTable.weekId, weekId)));

		return { success: true };
	},
	deleteEmployee: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);
		const weekId = parseInt(data.get('weekId') as string);

		await db.delete(employeesToWeeksTable).where(and(eq(employeesToWeeksTable.employeeId, id), eq(employeesToWeeksTable.weekId, weekId)));

		return { success: true };
	}
};
