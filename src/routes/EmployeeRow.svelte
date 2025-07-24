<script lang="ts">
	import { selectedCategoryTypes, totals, isReadOnly } from '$lib/stores.svelte';
	import { formatMonetaryValue } from '$lib/utils';
	import IncidenceCell from './IncidenceCell.svelte';
	import EditEmployee from './EditEmployee.svelte';

	let {
		employee,
		incidenceCategories
	}: {
		employee: Employee;
		incidenceCategories: IncidenceCategory[];
	} = $props();

	let incidenciasMapByCategory = new Map<number, Incidence>(
		employee.incidences.map((incidence) => [incidence.categoryId, incidence])
	);
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
	{#each incidenceCategories as category}
	{@const incidence = incidenciasMapByCategory.get(category.id)}
		{#if incidence}
		<IncidenceCell {category} {employee} {incidence} />
		{/if}
	{/each}
	{#each selectedCategoryTypes.value as categoryType}
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