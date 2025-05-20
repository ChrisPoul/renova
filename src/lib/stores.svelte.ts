import { categoryTypes } from './constants';

type categoryID = number;
type employeeID = number;
type employeeTotal = number;
type incidenciaTotal = number;

interface Totals {
	byCategory: Map<categoryID, Map<employeeID, incidenciaTotal>>;
	byCategoryType: Map<CategoryType, Map<employeeID, employeeTotal>>;
}

export const totals = $state<Totals>({
	byCategory: new Map(),
	byCategoryType: new Map()
});

export const selectedCategoryTypes = $state({
	value: categoryTypes
});
