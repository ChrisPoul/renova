import { categoryTypes } from './constants';

type CategoryId = number;
type employeeID = number;
type employeeCategoryTypeTotal = number;
type CategoryType = string;

// The shape of the object holding totals for a single incidence
export interface IncidenceCell {
	incidenceId: number;
	amount: number;
	monetaryValue: number;
	unitMonetaryValue: number;
	categoryType: CategoryType;
	unit: string;
	unitValueIsDerived: boolean;
	basedOnCategory: boolean
}

// The main reactive state for all incidence data
type IncidenceCells = Map<CategoryId, Map<employeeID, IncidenceCell>>;
export const incidenceCells = $state<{ value: IncidenceCells }>({
	value: new Map()
});

// The shape of the object holding the aggregated total for a single category
type CategoryTotal = {
	amount: number;
	monetaryValue: number;
};

// The main derived state for all aggregated totals
const derivedTotals = $derived.by(() => {
	const newTotals = {
		grandTotal: 0,
		categoryTypeTotals: new Map<CategoryType, Map<employeeID, employeeCategoryTypeTotal>>(),
		categoryTypeGrandTotals: new Map<CategoryType, number>(),
		categoryTotals: new Map<CategoryId, CategoryTotal>(),
		employeeTotals: new Map<employeeID, number>()
	};
	console.log('Calculating totals...');
	// Loop through all incidences to calculate the totals
	for (const [categoryId, categoryIncidenceCells] of incidenceCells.value) {
		for (const [employeeId, incidenceCell] of categoryIncidenceCells) {
			const { amount, monetaryValue, categoryType } = incidenceCell;

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
				newTotals.categoryTypeTotals.set(categoryType, new Map());
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

			// 4. Aggregate totals per employee
			const currentEmployeeTotal = newTotals.employeeTotals.get(employeeId) ?? 0;
			if (categoryType === 'deduccion') {
				newTotals.employeeTotals.set(employeeId, currentEmployeeTotal - monetaryValue);
			} else {
				newTotals.employeeTotals.set(employeeId, currentEmployeeTotal + monetaryValue);
			}

			// 5. Calculate the final grand total, subtracting deductions
			if (categoryType === 'deduccion') {
				newTotals.grandTotal -= monetaryValue;
			} else {
				newTotals.grandTotal += monetaryValue;
			}
		}
	}

	return newTotals;
});

export const totals = {
	get value() {
		return derivedTotals;
	}
};

export const selectedCategoryTypes = $state({
	value: categoryTypes
});

export const selectedWeek = $state({ value: null });

export const isReadOnly = $state({ value: false });
