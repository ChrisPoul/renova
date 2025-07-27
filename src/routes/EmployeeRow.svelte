<script lang="ts">
	import { selectedCategoryTypes, totals, isReadOnly, categories } from '$lib/stores.svelte';
	import { formatMonetaryValue } from '$lib/utils';
	import IncidenceCell from './IncidenceCell.svelte';
	import EditEmployee from './EditEmployee.svelte';

	let {
		employee,
		categoriesByType
	}: {
		employee: Employee;
		categoriesByType: Map<CategoryType, Category[]>;
	} = $props();
</script>

<tr class="odd:bg-white even:bg-gray-50">
	<td class="t-cell sticky left-0 bg-gray-200 text-nowrap">
		{employee.name}
		{#if !isReadOnly.value}
			<EditEmployee {employee} />
		{/if}
	</td>
	<td class="t-cell text-nowrap">{employee.area}</td>
	<td class="t-cell text-nowrap">{employee.puesto}</td>
	<td class="t-cell text-nowrap">{formatMonetaryValue(employee.salary)}</td>
	{#each categoriesByType as [categoryType, categoriesInType]}
		{#each categoriesInType as category}
			<IncidenceCell {category} {employee} />
		{/each}
		<td class="t-cell text-nowrap">
			{formatMonetaryValue(
				totals.value.categoryTypeTotals.get(categoryType)?.get(employee.id) ?? 0
			)}
		</td>
	{/each}
	<td class="t-cell sticky right-0 bg-gray-200 text-nowrap">
		{formatMonetaryValue(totals.value.employeeTotals.get(employee.id) ?? 0)}
	</td>
</tr>
