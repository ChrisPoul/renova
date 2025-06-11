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
	incidencia: Incidence,
	category: IncidenceCategory,
	employee: Employee
) {
	const unitMonetaryValue = getIncidenceUnitMonetaryValue(incidencia, category, employee);
	return incidencia.amount * unitMonetaryValue;
}

export function getIncidenceUnitMonetaryValue(
	incidencia: Incidence,
	category: IncidenceCategory,
	employee: Employee
) {
	let unit = incidencia.unit;
	let unitMonetaryValue = incidencia.unitMonetaryValue;
	let unitValueIsDerived = incidencia.unitValueIsDerived;
	if (incidencia.basedOnCategory) {
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
