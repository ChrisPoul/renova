import { categoryTypes } from './constants';

type categoryID = number;
type employeeID = number;
type employeeTotal = number;
interface incidenceTotal {
	amount: number;
	monetaryValue: number;
}

interface Totals {
	byCategory: Map<categoryID, Map<employeeID, incidenceTotal>>;
	byCategoryType: Map<string, Map<employeeID, employeeTotal>>;
}

export const totals = $state<Totals>({
	byCategory: new Map(),
	byCategoryType: new Map()
});

export const selectedCategoryTypes = $state({
	value: categoryTypes
});
