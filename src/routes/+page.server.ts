import { db } from '$lib/server/db';
import { makeDummyData } from '$lib/server/db/index';
import { weeksTable } from '$lib/server/db/schema';
import type { IncidenceCells } from '$lib/stores.svelte.js';
import { getInitiatedIncidenceCells } from '$lib/utils.js';
import { eq } from 'drizzle-orm';
import { getWeekFromDate } from '$lib/utils.js';

export async function load({ url, fetch }) {
	let weekId: string | null = url.searchParams.get('weekId');
	let incidenceCells: IncidenceCells = new Map();
	let employees: Employees = new Map();
	let categories: Categories = new Map();

	let weeks = await db.query.weeksTable.findMany();
	if (weeks.length === 0) {
		await makeDummyData();
		weeks = await db.query.weeksTable.findMany();
	}

	if (!weekId) {
		const today = new Date();
		const { startDate } = getWeekFromDate(today);
		const res = await fetch('/api/weeks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ date: startDate.toISOString().split('T')[0] })
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
