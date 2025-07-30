<script lang="ts">
	import { totals, isReadOnly, categoriesByType } from '$lib/stores.svelte';
	import { formatMonetaryValue } from '$lib/utils';
	import IncidenceCell from './IncidenceCell.svelte';
	import EditEmployee from '$lib/components/employees/EditEmployee.svelte';

	let {
		employee,
	}: {
		employee: Employee;
	} = $props();

</script>

<tr class="odd:bg-white even:bg-gray-50">
	<td class="t-cell sticky left-0 bg-gray-200 text-nowrap">
		<span class="flex relative justify-center {!isReadOnly.value && 'pr-5'}">
			{employee.name}
			{#if !isReadOnly.value}
			<div class="absolute right-0">
				<EditEmployee {employee} />
			</div>
			{/if}
		</span>
	</td>
	<td class="t-cell text-nowrap">{employee.area}</td>
	<td class="t-cell text-nowrap">{employee.puesto}</td>
	<td class="t-cell text-nowrap">{formatMonetaryValue(employee.salary)}</td>
	{#each categoriesByType.value as [categoryType, categoriesInType]}
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
