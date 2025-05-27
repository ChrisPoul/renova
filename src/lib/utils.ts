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
export function getCategoryTypeLabel(category: CategoryType) {
	category = capitalizeFirstLetter(category) as CategoryType;
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

export function getIncidenciaTotalMonetaryValue(
	incidencia: Incidencia,
	category: CategoriaIncidencia,
	employee: Employee
) {
	const unitMonetaryValue = getIncidenciaUnitMonetaryValue(incidencia, category, employee);
	return incidencia.amount * unitMonetaryValue;
}

export function getIncidenciaUnitMonetaryValue(
	incidencia: Incidencia,
	category: CategoriaIncidencia,
	employee: Employee
) {
	let unit = incidencia.unit;
	if (!unit) {
		unit = category.unit;
	}
	if (unit === 'días') {
		return employee.salary / 5;
	} else if (unit === 'horas') {
		return employee.salary / 40;
	}
	let unitMonetaryValue = incidencia.unitMonetaryValue;
	if (!unitMonetaryValue) {
		unitMonetaryValue = category.unitMonetaryValue;
	}
	return unitMonetaryValue;
}
