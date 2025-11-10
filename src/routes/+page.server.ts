import { db } from '$lib/server/db';
import { weeksTable } from '$lib/server/db/schema';
import type { IncidenceCells } from '$lib/stores.svelte.js';
import { getInitiatedIncidenceCells } from '$lib/utils.js';
import { eq } from 'drizzle-orm';

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
            { ...etw, name: etw.employee.name, codigo: etw.employee.codigo, id: etw.employeeId }
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
