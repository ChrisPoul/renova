import { incidenceTotals } from './stores.svelte';

export function formatMonetaryValue(value: number) {
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

export function getIncidenceTotalMonetaryValue(
	incidence: Incidence,
	category: IncidenceCategory,
	employee: Employee
) {
	const unitMonetaryValue = getIncidenceUnitMonetaryValue(incidence, category, employee);
	return incidence.amount * unitMonetaryValue;
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

function setIncidenceTotal(
	categoryId: number,
	employeeId: number,
	amount: number,
	monetaryValue: number,
	categoryType: string
) {
	if (!incidenceTotals.value.get(categoryId)) {
		incidenceTotals.value.set(categoryId, new Map());
	}
	incidenceTotals.value.get(categoryId)?.set(employeeId, {
		monetaryValue: monetaryValue,
		amount: amount,
		categoryType: categoryType
	});
}

export function getAndSetIncidenceTotal(incidence: Incidence, category: IncidenceCategory, employee: Employee) {
	let incidenciaTotalMonetaryValue = getIncidenceTotalMonetaryValue(
		incidence,
		category,
		employee
	);
	setIncidenceTotal(
		category.id,
		employee.id,
		incidence.amount,
		incidenciaTotalMonetaryValue,
		category.type
	);
}

export function updateAllTotals(employees: Employee[], incidenceCategories: IncidenceCategory[]) {
	const categoryMap = new Map(incidenceCategories.map((c) => [c.id, c]));

	for (const employee of employees) {
		for (const incidence of employee.incidences) {
			const category = categoryMap.get(incidence.categoryId);
			if (!category) continue;
			getAndSetIncidenceTotal(incidence, category, employee);
		}
	}
	incidenceTotals.value = new Map(incidenceTotals.value);
}
