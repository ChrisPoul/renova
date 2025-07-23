import { categoryTypes } from './constants';

type categoryID = number;
type employeeID = number;
type employeeCategoryTypeTotal = number;
interface incidenceTotal {
	amount: number;
	monetaryValue: number;
}
export type CategoryTypesTotals = Map<string, Map<employeeID, employeeCategoryTypeTotal>>

interface Totals {
	incidences: Map<categoryID, Map<employeeID, incidenceTotal>>;
	categoryTypes: CategoryTypesTotals;
}

export const totals = $state<Totals>({
	incidences: new Map(),
	categoryTypes: new Map(),
});

export const selectedCategoryTypes = $state({
	value: categoryTypes
});

export const selectedWeek = $state({ value: null });
