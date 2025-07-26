import { db } from '$lib/server/db';
import { makeDummyData } from '$lib/server/db/index';
import {
	weeksTable,
} from '$lib/server/db/schema';
import type { IncidenceCells } from '$lib/stores.svelte.js';
import { getInitiatedIncidenceCells } from '$lib/utils.js';
import { eq } from 'drizzle-orm';

export async function load({ url }) {
	let weekId: string | number | null = url.searchParams.get('weekId');
	let incidenceCells: IncidenceCells = new Map();
	let employees: Employees = new Map();
	let incidenceCategories: IncidenceCategories = new Map();

	let weeks = await db.query.weeksTable.findMany();
	if (weeks.length === 0) {
		await makeDummyData();
		weeks = await db.query.weeksTable.findMany();
	}

	if (!weekId) {
		// If no weekId is provided, we should get the current week, so taking todays date as refernece we pull that week, use the weeks api
		weekId = weeks[0].id
	}
	const week = await db.query.weeksTable.findFirst({
		where: eq(weeksTable.id, +weekId),
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
		return { employees, incidenceCategories, incidenceCells, week: null };
	}
	employees = new Map(week.employeesToWeeks.map((etw) => [etw.employeeId, etw.employee]));
	incidenceCategories = new Map(
		week.categoriesToWeeks.map((ctw) => [ctw.categoryId, ctw.category])
	);
	incidenceCells = getInitiatedIncidenceCells(
		employees,
		incidenceCategories,
		week.incidences
	);
	return {
		employees,
		incidenceCategories,
		incidenceCells,
		week
	};
}
