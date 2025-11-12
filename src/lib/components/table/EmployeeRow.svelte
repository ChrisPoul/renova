<script lang="ts">
import {
	totals,
	isReadOnly,
	categoriesByType,
	selectedWeek,
	resumen,
	selectedCategoryGroups
} from '$lib/stores.svelte';
import { formatMonetaryValue } from '$lib/utils';
import IncidenceCell from './IncidenceCell.svelte';
	import EditEmployee from '$lib/components/employees/EditEmployee.svelte';
	import {
		EMPLOYEE_COLUMNS,
		COMPUTED_COLUMNS,
		EMPLOEYEE_WEEK_COLUMNS,
		EMPLOYEE_RESUMEN_COLUMNS
	} from '$lib/constants';

	const showResumen = $derived.by(() => selectedCategoryGroups.value.includes('resumen'));
	import { invalidateAll } from '$app/navigation';

	let {
		employee,
	}: {
		employee: Employee;
	} = $props();

async function updateEmployeeWeekValue(key: string, event: Event) {
	if (isReadOnly.value || !selectedWeek.value) return;

	const target = event.target as HTMLInputElement;
	let newValue = Number(target.value);
	if (!Number.isFinite(newValue)) {
		newValue = 0;
	}

	await fetch('/api/employees-to-week', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			employeeId: employee.id,
			weekId: selectedWeek.value!.id,
			changes: { [key]: newValue }
		})
	});
	invalidateAll();
}

</script>

<tr class="odd:bg-white even:bg-gray-50">
	{#each EMPLOYEE_COLUMNS as col}
		<td class="t-cell {col.key === 'name' ? 'sticky left-0 bg-gray-200' : ''} text-nowrap">
			{#if col.key === 'name'}
				<span class="flex relative justify-center {!isReadOnly.value && 'pr-5'}">
					{employee.name}
					{#if !isReadOnly.value}
						<div class="absolute right-0">
							<EditEmployee {employee} />
						</div>
					{/if}
				</span>
			{:else}
				{employee[col.key as keyof Employee]}
			{/if}
		</td>
	{/each}
{#each EMPLOEYEE_WEEK_COLUMNS as col}
		<td class="t-cell bg-gray-200 text-nowrap">
			{#if isReadOnly.value}
				{formatMonetaryValue(employee[col.key as keyof Employee])}
			{:else}
				<input
					type="number"
					step=".01"
					class="rounded-md border border-gray-500 px-2 py-1"
					value={employee[col.key as keyof Employee]}
					oninput={(event) => updateEmployeeWeekValue(col.key, event)}
					style="width: {`${(employee[col.key as keyof Employee]?.toString().length || 1) + 4}ch`}; min-width: 8ch;"
				/>
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
	{#if showResumen}
		{#each EMPLOYEE_RESUMEN_COLUMNS as col}
			{@const resumenEmployee = resumen.value.employees.get(employee.id)}
			{@const value = resumenEmployee?.[col.key as keyof typeof resumenEmployee] ?? 0}
			<td class="t-cell bg-gray-200 resumen text-nowrap">
				{#if col.format === 'currency'}
					{formatMonetaryValue(value)}
				{:else}
					{value}
				{/if}
			</td>
		{/each}
	{/if}
	{#each COMPUTED_COLUMNS as col}
		<td class="t-cell {col.employeeKey === 'employeeTotals' ? 'sticky right-0 bg-gray-200' : ''} text-nowrap">
			{formatMonetaryValue((totals.value as any)[col.employeeKey].get(employee.id) ?? 0)}
		</td>
	{/each}
</tr>
