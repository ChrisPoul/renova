export function formatMonetaryValue(value: number) {
	return value.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}) + '$';
}

export function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
export function getParentCategoryLabel(
	category: ParentCategory
) {
	category = capitalizeFirstLetter(category) as ParentCategory;
	if (category.endsWith('ccion')) {
		return category.replace(/ccion$/, 'cción');
	}
	return category;
}