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
