import { incidenceCells, type IncidenceCell } from './stores.svelte';

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

export function validateAmount(amount: number) {
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

export function getIncidenceUnitMonetaryValue(
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
	categoryId: number,
	employeeId: number,
	newIncidenceCell: IncidenceCell
) {
	if (!incidenceCells.value.get(categoryId)) {
		incidenceCells.value.set(categoryId, new Map());
	}
	incidenceCells.value.get(categoryId)?.set(employeeId, newIncidenceCell);
}

export function initiateIncidenceCell(
	incidence: Incidence,
	category: IncidenceCategory,
	employee: Employee
) {
	const unitMonetaryValue = getIncidenceUnitMonetaryValue(incidence, category, employee);
	const monetaryValue = getIncidenceTotalMonetaryValue(incidence.amount, unitMonetaryValue);
	let unit = incidence.unit;
	let unitValueIsDerived = incidence.unitValueIsDerived;
	if (incidence.basedOnCategory) {
		unit = category.unit;
		unitValueIsDerived = category.unitValueIsDerived;
	}
	setIncidenceCell(category.id, employee.id, {
		incidenceId: incidence.id,
		unitMonetaryValue,
		monetaryValue,
		unit,
		amount: incidence.amount,
		categoryType: category.type,
		unitValueIsDerived,
		basedOnCategory: incidence.basedOnCategory
	});
}

export function getIncidenceTotalMonetaryValue(incidenceAmount: number, unitMonetaryValue: number) {
	return incidenceAmount * unitMonetaryValue;
}

export function initiateIncidenceCells(
	employees: Employee[],
	incidenceCategories: IncidenceCategory[]
) {
	const categoryMap = new Map(incidenceCategories.map((c) => [c.id, c]));

	for (const employee of employees) {
		for (const incidence of employee.incidences) {
			const category = categoryMap.get(incidence.categoryId);
			if (!category) continue;
			initiateIncidenceCell(incidence, category, employee);
		}
	}
	incidenceCells.value = new Map(incidenceCells.value);
}
