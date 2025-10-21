<script lang="ts">
	import { totals, isReadOnly, categoriesByType } from '$lib/stores.svelte';
	import { formatMonetaryValue } from '$lib/utils';
	import IncidenceCell from './IncidenceCell.svelte';
	import EditEmployee from '$lib/components/employees/EditEmployee.svelte';
	import { EMPLOYEE_COLUMNS, COMPUTED_COLUMNS } from '$lib/constants';

	let {
		employee,
	}: {
		employee: Employee;
	} = $props();

</script>

<tr class="odd:bg-white even:bg-gray-50">
	{#each EMPLOYEE_COLUMNS as col}
		<td class="t-cell {col.key === 'name' ? 'sticky left-0 bg-gray-200' : ''} text-nowrap">
			{#if col.key === 'name'}
				<span class="flex relative justify-center {!isReadOnly.value && 'pr-5'}">
					{employee[col.key]}
					{#if !isReadOnly.value}
						<div class="absolute right-0">
							<EditEmployee {employee} />
						</div>
					{/if}
				</span>
			{:else if col.key === 'salary'}
				{formatMonetaryValue(employee[col.key])}
			{:else}
				{employee[col.key as keyof Employee]}
			{/if}
		</td>
	{/each}
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
	{#each COMPUTED_COLUMNS as col}
		<td class="t-cell {col.employeeKey === 'employeeTotals' ? 'sticky right-0 bg-gray-200' : ''} text-nowrap">
			{formatMonetaryValue((totals.value as any)[col.employeeKey].get(employee.id) ?? 0)}
		</td>
	{/each}
</tr>
