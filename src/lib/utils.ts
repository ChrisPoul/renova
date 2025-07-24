import type { CategoryTypesTotals } from '$lib/stores.svelte';
import { totals, selectedCategoryTypes } from '$lib/stores.svelte';

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

export function getEmployeeTotalFromCategoryTypeTotals(
	categoryTypes: string[],
	employeeId: number,
	categoryTypesTotals: CategoryTypesTotals
) {
	let total = 0;
	for (const categoryType of categoryTypes) {
		const categoryTypeTotal = categoryTypesTotals.get(categoryType)?.get(employeeId);
		if (!categoryTypeTotal) continue;
		if (categoryType === 'deduccion') {
			total -= categoryTypeTotal;
		} else {
			total += categoryTypeTotal;
		}
	}
	return total;
}

export function getTotalsByCategoryType() {
	const totalsByCategoryType = new Map<string, number>([['all', 0]]);
	for (const categoryType of selectedCategoryTypes.value) {
		const categoryTypeTotal = getCategoryTypeTotalMonetaryValue(categoryType);
		totalsByCategoryType.set(categoryType, categoryTypeTotal);
		const prevTotal = totalsByCategoryType.get('all') ?? 0;
		if (categoryType === 'deduccion') {
			totalsByCategoryType.set('all', prevTotal - categoryTypeTotal);
		} else {
			totalsByCategoryType.set('all', prevTotal + categoryTypeTotal);
		}
	}
	return totalsByCategoryType;
}

export function getCategoryTypeTotalMonetaryValue(categoryType: string) {
	let total = 0;
	const categoryTypeTotals = totals.categoryTypes.get(categoryType);
	if (!categoryTypeTotals) return 0;
	for (const [employeeId, employeeCategoryTypeTotal] of categoryTypeTotals) {
		total += employeeCategoryTypeTotal;
	}
	return total;
}

export function getCategoryTotalMonetaryValueAndAmount(categoryId: number) {
	let total = {
		monetaryValue: 0,
		amount: 0
	};
	const incidenciaTotalsInCategory = totals.incidences.get(categoryId);
	if (!incidenciaTotalsInCategory) return total;
	for (const [employeeId, incidenciaTotal] of incidenciaTotalsInCategory) {
		total.monetaryValue += incidenciaTotal.monetaryValue;
		total.amount += incidenciaTotal.amount;
	}
	return total;
}
