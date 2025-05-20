import { parentCategories } from "./constants";

type categoryID = number;
type employeeID = number;
type employeeTotal = number;
type incidenciaTotal = number;

interface Totals {
	byCategory: Map<categoryID, Map<employeeID, incidenciaTotal>>;
	byEmployee: Map<employeeID, employeeTotal>;
	byParentCategory: Map<ParentCategory, Map<employeeID, employeeTotal>>;
}

export const totals = $state<Totals>({
	byCategory: new Map(),
	byEmployee: new Map(),
	byParentCategory: new Map()
});

export const selectedParentCategories = $state({
	value: parentCategories
});
