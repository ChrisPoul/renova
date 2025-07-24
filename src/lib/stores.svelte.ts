import { SvelteMap } from 'svelte/reactivity';
import { categoryTypes } from './constants';

type CategoryId = number;
type employeeID = number;
type employeeCategoryTypeTotal = number;
type CategoryType = string;

// The shape of the object holding totals for a single incidence
interface IncidenceTotal {
	amount: number;
	monetaryValue: number;
	categoryType: CategoryType;
}

// The main reactive state for all incidence data
type IncidenceTotals = Map<CategoryId, Map<employeeID, IncidenceTotal>>;
export const incidenceTotals = $state<IncidenceTotals>(new SvelteMap());

// The shape of the object holding the aggregated total for a single category
type CategoryTotal = {
	amount: number;
	monetaryValue: number;
};
type EmployeeTotal = number

// The main derived state for all aggregated totals
export const totals = $derived.by(() => {
	const newTotals = {
		grandTotal: 0,
		categoryTypeTotals: new SvelteMap<CategoryType, SvelteMap<employeeID, employeeCategoryTypeTotal>>(),
		categoryTypeGrandTotals: new SvelteMap<CategoryType, number>(),
		categoryTotals: new SvelteMap<CategoryId, CategoryTotal>(),
		employeeTotals: new SvelteMap<employeeID, EmployeeTotal>()
	};

	// Loop through all incidences to calculate the totals
	for (const [categoryId, employeeIncidences] of incidenceTotals) {
		for (const [employeeId, incidence] of employeeIncidences) {
			const { amount, monetaryValue, categoryType } = incidence;

			// 1. Aggregate totals per category (for the table footer)
			const currentCategoryTotal = newTotals.categoryTotals.get(categoryId) ?? {
				amount: 0,
				monetaryValue: 0
			};
			currentCategoryTotal.amount += amount;
			currentCategoryTotal.monetaryValue += monetaryValue;
			newTotals.categoryTotals.set(categoryId, currentCategoryTotal);

			// 2. Aggregate totals per employee per category type (for the employee row totals)
			if (!newTotals.categoryTypeTotals.has(categoryType)) {
				newTotals.categoryTypeTotals.set(categoryType, new SvelteMap());
			}
			const employeeCategoryTypeTotal =
				newTotals.categoryTypeTotals.get(categoryType)!.get(employeeId) ?? 0;
			newTotals.categoryTypeTotals
				.get(categoryType)!
				.set(employeeId, employeeCategoryTypeTotal + monetaryValue);

			// 3. Aggregate grand totals per category type (for the table footer)
			const currentCategoryTypeGrandTotal =
				newTotals.categoryTypeGrandTotals.get(categoryType) ?? 0;
			newTotals.categoryTypeGrandTotals.set(
				categoryType,
				currentCategoryTypeGrandTotal + monetaryValue
			);

			// 4. Calculate the final grand total, subtracting deductions
			if (categoryType === 'deduccion') {
				newTotals.grandTotal -= monetaryValue;
			} else {
				newTotals.grandTotal += monetaryValue;
			}
		}
	}

	return newTotals;
});

export const selectedCategoryTypes = $state({
	value: categoryTypes
});

export const selectedWeek = $state({ value: null });

export const isReadOnly = $state({ value: false });