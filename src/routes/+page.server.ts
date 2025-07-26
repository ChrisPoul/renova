import { db } from '$lib/server/db';
import {
	makeDummyData
} from '$lib/server/db/index';
import {
	weeksTable,
	type Employee,
	type Incidence,
	type IncidenceCategory
} from '$lib/server/db/schema';
import type { IncidenceCells } from '$lib/stores.svelte.js';
import { getInitiatedIncidenceCells } from '$lib/utils.js';
import { eq } from 'drizzle-orm';

export async function load({ url }) {
	const weekId = url.searchParams.get('weekId');
	let incidenceCells: IncidenceCells = new Map();
	let employees: Employee[] = [];
	let incidenceCategories: IncidenceCategory[] = [];

	const weeks = await db.query.weeksTable.findMany()
	if (weeks.length === 0) {
		await makeDummyData()
	}

	if (!weekId) {
		// If no weekId is provided, we should get the current week, so taking todays date as refernece we pull that week, use the weeks api 
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
	const incidencesByEmployee = new Map<number, Incidence[]>();
	for (const incidence of week.incidences) {
		const employeeId = incidence.employeeId;
		if (!incidencesByEmployee.has(employeeId)) {
			incidencesByEmployee.set(employeeId, []);
		}
		incidencesByEmployee.get(employeeId)!.push(incidence);
	}
	for (const employeeToWeek of week.employeesToWeeks) {
		const employee = employeeToWeek.employee;
		employees.push({
			...employee,
			incidences: incidencesByEmployee.get(employee.id) || []
		});
	}
	incidenceCategories = week.categoriesToWeeks.map((ctw) => ctw.category);
	incidenceCells = getInitiatedIncidenceCells(incidenceCells, employees, incidenceCategories);
	return {
		employees,
		incidenceCategories,
		incidenceCells,
		week
	};
}
