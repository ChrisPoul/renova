import type { Employee, Incidence, IncidenceCategory } from './server/db/schema';
import type {IncidenceCell, IncidenceCells } from './stores.svelte';

export function formatMonetaryValue(value: number | undefined) {
	if (value === undefined) {
		value = 0;
	}
	return (
		value.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}) + '$'
	);
}

export function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
export function getCategoryTypeLabel(category: string) {
	category = capitalizeFirstLetter(category);
	if (category.endsWith('ccion')) {
		return category.replace(/ccion$/, 'cción');
	}
	return category;
}

export function validateAmount(amount: number | null) {
	if (!amount) return amount;
	if (isNaN(amount)) return 0;
	if (amount < 0) return 0;

	const numString = amount.toString();
	const decimalIndex = numString.indexOf('.');
	if (decimalIndex === -1) {
		return amount;
	}
	const truncatedString = numString.slice(0, decimalIndex + 3);
	return parseFloat(truncatedString);
}

export function getIncidenceCellUnitMonetaryValue(
	incidence: Incidence,
	category: IncidenceCategory,
	employee: Employee
) {
	let unit = incidence.unit;
	let unitMonetaryValue = incidence.unitMonetaryValue;
	let unitValueIsDerived = incidence.unitValueIsDerived;
	if (incidence.basedOnCategory) {
		unit = category.unit;
		unitMonetaryValue = category.unitMonetaryValue;
		unitValueIsDerived = category.unitValueIsDerived;
	}
	if (unit === 'días' && unitValueIsDerived) {
		return employee.salary / 5;
	} else if (unit === 'horas' && unitValueIsDerived) {
		return employee.salary / 40;
	}
	return unitMonetaryValue;
}

export function setIncidenceCell(
	incidenceCells: IncidenceCells,
	categoryId: number,
	employeeId: number,
	newIncidenceCell: IncidenceCell
) {
	if (!incidenceCells.get(categoryId)) {
		incidenceCells.set(categoryId, new Map());
	}
	incidenceCells.get(categoryId)?.set(employeeId, newIncidenceCell);
}

export function initiateIncidenceCell(
	incidenceCells: IncidenceCells,
	incidence: Incidence,
	category: IncidenceCategory,
	employee: Employee
) {
	const unitMonetaryValue = getIncidenceCellUnitMonetaryValue(incidence, category, employee);
	const totalMonetaryValue = getIncidenceCellTotalMonetaryValue(incidence.amount, unitMonetaryValue);
	let unit = incidence.unit;
	let unitValueIsDerived = incidence.unitValueIsDerived;
	if (incidence.basedOnCategory) {
		unit = category.unit;
		unitValueIsDerived = category.unitValueIsDerived;
	}
	setIncidenceCell(incidenceCells, category.id, employee.id, {
		incidenceId: incidence.id,
		unitMonetaryValue,
		totalMonetaryValue,
		unit,
		amount: incidence.amount,
		categoryType: category.type,
		unitValueIsDerived,
		basedOnCategory: incidence.basedOnCategory
	});
}

export function getIncidenceCellTotalMonetaryValue(
	amount: number,
	unitMonetaryValue: number
) {
	return amount * unitMonetaryValue;
}

export function getInitiatedIncidenceCells(
	incidenceCells: IncidenceCells,
	employees: Map<EmployeeId, Employee>,
	incidenceCategories: Map<CategoryId, IncidenceCategory>,
	incidences: Incidence[]
) {
		for (const incidence of incidences) {
			const category = incidenceCategories.get(incidence.categoryId)
			const employee = employees.get(incidence.employeeId)
			if (!category || !employee) continue;
			initiateIncidenceCell(incidenceCells, incidence, category, employee);
		}

	return incidenceCells;
}
