import type { IncidenceCell, IncidenceCells } from './stores.svelte';

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

export function getIncidenceUnitMonetaryValue(
	incidence: Incidence,
	category: Category,
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
	category: Category,
	employee: Employee
) {
	const unitMonetaryValue = getIncidenceUnitMonetaryValue(incidence, category, employee);
	const totalMonetaryValue = getIncidenceCellTotalMonetaryValue(
		incidence.amount,
		unitMonetaryValue
	);
	let unit = incidence.unit;
	let unitValueIsDerived = incidence.unitValueIsDerived;
	if (incidence.basedOnCategory) {
		unit = category.unit;
		unitValueIsDerived = category.unitValueIsDerived;
	}
	setIncidenceCell(incidenceCells, category.id, employee.id, {
		incidence: { ...incidence, unit, unitMonetaryValue, unitValueIsDerived },
		totalMonetaryValue,
		categoryType: category.type
	});
}

export function getIncidenceCellTotalMonetaryValue(amount: number, unitMonetaryValue: number) {
	return amount * unitMonetaryValue;
}

export function getInitiatedIncidenceCells(
	employees: Map<EmployeeId, Employee>,
	categories: Map<CategoryId, Category>,
	incidences: Incidence[]
) {
	const incidenceCells: IncidenceCells = new Map();
	for (const incidence of incidences) {
		const category = categories.get(incidence.categoryId);
		const employee = employees.get(incidence.employeeId);
		if (!category || !employee) continue;
		initiateIncidenceCell(incidenceCells, incidence, category, employee);
	}

	return incidenceCells;
}

export function getWeekFromDate(date: string | Date) {
	const selectedDate = new Date(date);
	const dayOfWeek = selectedDate.getUTCDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

	// Adjust to a Wednesday-starting week
	// If the day is Wednesday (3) or later, the week starts on the most recent Wednesday.
	// If the day is before Wednesday, the week starts on the previous Wednesday.
	const daysToSubtract = (dayOfWeek - 3 + 7) % 7;
	const startDate = new Date(selectedDate);
	startDate.setUTCDate(selectedDate.getUTCDate() - daysToSubtract);

	const endDate = new Date(startDate);
	endDate.setUTCDate(startDate.getUTCDate() + 6);

	return { startDate, endDate };
}

/**
 * Parsea un valor numérico que puede venir del Excel en diferentes formatos
 * Maneja formatos como: "$10.23", "10.23", 10.23, "10,23", etc.
 * @param value - El valor a parsear (puede ser string, number, null, undefined)
 * @returns El número parseado o 0 si no se puede parsear
 */
export function parseExcelNumber(value: any): number {
	if (value === null || value === undefined) {
		return 0;
	}

	// Si ya es un número, devolverlo
	if (typeof value === 'number') {
		return isNaN(value) ? 0 : value;
	}

	// Si es string, limpiarlo y parsearlo
	if (typeof value === 'string') {
		// Remover símbolos de moneda y espacios
		let cleanValue = value.trim()
			.replace(/[$]/g, '') // Remover símbolo de dólar
			.replace(/[€]/g, '') // Remover símbolo de euro
			.replace(/[₡]/g, '') // Remover símbolo de colón
			.replace(/[₡]/g, '') // Remover símbolo de peso
			.replace(/[₡]/g, '') // Remover otros símbolos de moneda
			.replace(/,/g, '') // Remover comas (separadores de miles)
			.replace(/\s/g, ''); // Remover espacios

		// Si está vacío después de limpiar, devolver 0
		if (cleanValue === '') {
			return 0;
		}

		// Intentar parsear el número
		const parsed = parseFloat(cleanValue);
		return isNaN(parsed) ? 0 : parsed;
	}

	// Para cualquier otro tipo, devolver 0
	return 0;
}