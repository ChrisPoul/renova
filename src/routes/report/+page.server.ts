import { db } from '$lib/server/db';
import { and, gte, lte } from 'drizzle-orm';
import { weeksTable } from '$lib/server/db/schema';
import { getInitiatedIncidenceCells } from '$lib/utils.js';
import type { IncidenceCells } from '$lib/stores.svelte.js';

export async function load({ url }) {
	const startDate = url.searchParams.get('startDate');
	const endDate = url.searchParams.get('endDate');

	const finalIncidenceCells: IncidenceCells = new Map();
	const finalEmployees: Employees = new Map();
	const finalCategories: Categories = new Map();

	if (!startDate || !endDate) {
		return {
			employees: finalEmployees,
			categories: finalCategories,
			incidenceCells: finalIncidenceCells,
			startDate: '',
			endDate: ''
		};
	}

	const start = new Date(startDate);
	const end = new Date(endDate);

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
		const weekCategories: Map<CategoryId, Category> = new Map();
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
		categories: finalCategories,
		incidenceCells: finalIncidenceCells,
		startDate,
		endDate
	};
}
