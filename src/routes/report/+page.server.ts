import { db } from '$lib/server/db';
import { and, gte, lte } from 'drizzle-orm';
import {
	weeksTable,
	type Employee,
	type Incidence,
	type IncidenceCategory
} from '$lib/server/db/schema';
import { getInitiatedIncidenceCells } from '$lib/utils.js';
import type { IncidenceCells } from '$lib/stores.svelte.js';

function getDateFromWeekString(weekString: string): Date {
	const [year, week] = weekString.split('-W').map(Number);
	// Create a date for the first day of the year, then add the number of weeks in days.
	// This gives a date within the correct week.
	const date = new Date(year, 0, 1 + (week - 1) * 7);
	// Adjust to the Monday of that week.
	date.setDate(date.getDate() - (date.getDay() || 7) + 1);
	return date;
}

export async function load({ url }) {
	const startWeek = url.searchParams.get('startWeek');
	const endWeek = url.searchParams.get('endWeek');

	const finalIncidenceCells: IncidenceCells = new Map();
	const finalEmployees: Employees = new Map();
	const finalCategories: IncidenceCategories = new Map();

	if (!startWeek || !endWeek) {
		return {
			employees: finalEmployees,
			incidenceCategories: finalCategories,
			incidenceCells: finalIncidenceCells
		};
	}

	const start = getDateFromWeekString(startWeek);
	const end = getDateFromWeekString(endWeek);
	// Set the end date to the end of the week to include all days
	end.setDate(end.getDate() + 6);

	const weeks = await db.query.weeksTable.findMany({
		where: and(gte(weeksTable.startDate, start), lte(weeksTable.endDate, end)),
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
	console.log(`Found ${weeks.length} weeks in the specified range`);

	for (const week of weeks) {
		const weekEmployees: Map<EmployeeId, Employee> = new Map();
		for (const employeeToWeek of week.employeesToWeeks) {
			const employee = employeeToWeek.employee;
			weekEmployees.set(employee.id, employee);
			const previousEmployee = finalEmployees.get(employee.id);
			if (!previousEmployee) {
				finalEmployees.set(employee.id, employee);
			} else {
				previousEmployee.salary += employee.salary;
			}
		}
		const weekCategories: Map<CategoryId, IncidenceCategory> = new Map();
		for (const categoryToWeek of week.categoriesToWeeks) {
			const category = categoryToWeek.category;
			weekCategories.set(category.id, category);
			if (!finalCategories.has(category.id)) {
				finalCategories.set(category.id, category);
			}
		}

		const weekIncidenceCell = getInitiatedIncidenceCells(
			weekEmployees,
			weekCategories,
			week.incidences
		);

		for (const [categoryId, categoryIncidenceCells] of weekIncidenceCell) {
			if (!finalIncidenceCells.has(categoryId)) {
				finalIncidenceCells.set(categoryId, new Map());
			}
			const finalCategoryIncidenceCells = finalIncidenceCells.get(categoryId);

			for (const [employeeId, incidenceCell] of categoryIncidenceCells) {
				if (!finalCategoryIncidenceCells!.has(employeeId)) {
					finalCategoryIncidenceCells!.set(employeeId, {
						...incidenceCell,
						incidence: {
							...incidenceCell.incidence,
							amount: 0
						},
						totalMonetaryValue: 0
					});
				}
				const finalIncidenceCell = finalCategoryIncidenceCells!.get(employeeId);
				finalIncidenceCell!.incidence.amount += incidenceCell.incidence.amount;
				finalIncidenceCell!.totalMonetaryValue += incidenceCell.totalMonetaryValue;
			}
		}
	}

	return {
		employees: finalEmployees,
		incidenceCategories: finalCategories,
		incidenceCells: finalIncidenceCells
	};
}
