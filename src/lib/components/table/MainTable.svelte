<script lang="ts">
	import EmployeeRow from '$lib/components/table/EmployeeRow.svelte';
	import {
		isReadOnly,
		totals,
		employees,
		categoriesByType,
		resumen,
		selectedCategoryGroups
	} from '$lib/stores.svelte';
	import { formatMonetaryValue, getCategoryTypeLabel } from '$lib/utils';
	import EditCategory from '$lib/components/categories/EditCategory.svelte';
	import {
		EMPLOYEE_COLUMNS,
		COMPUTED_COLUMNS,
		EMPLOEYEE_WEEK_COLUMNS,
		EMPLOYEE_RESUMEN_COLUMNS
	} from '$lib/constants';

	const showResumen = $derived.by(() => selectedCategoryGroups.value.includes('resumen'));
</script>

<div class="relative overflow-auto">
	<table class="m-2 border-collapse border border-gray-500">
		{@render tableHeaders()}
		<tbody>
			{#each employees.value as [_, employee]}
				<EmployeeRow {employee} />
			{/each}
		</tbody>
		{@render tableFooters()}
	</table>
</div>

{#snippet tableHeaders()}
	<thead>
		<tr class="bg-gray-100">
			{#each EMPLOYEE_COLUMNS as col}
				<th class="t-cell {col.key === 'name' ? 'sticky left-0 bg-gray-300' : 'bg-gray-200'}">
					{col.label}
				</th>
			{/each}
			{#each EMPLOEYEE_WEEK_COLUMNS as col}
				<th class="t-cell bg-gray-200">
					{col.label}
				</th>
			{/each}
			{#each categoriesByType.value as [categoryType, categoriesInType]}
				{#each categoriesInType as category}
					<th class={`t-cell ${category.type}`}>
						{category.concept}
						<span class="text-sm flex justify-center font-normal">
								{category.unit}
								{#if !category.unitValueIsDerived && category.unit != "$"}
									
								({formatMonetaryValue(category.unitMonetaryValue)})
								{/if}
						</span>
						{#if !isReadOnly.value}
							<EditCategory {category} />
						{/if}
					</th>
				{/each}
				<th class={`t-cell ${categoryType}`}>
					Total {getCategoryTypeLabel(categoryType)}
				</th>
			{/each}
			{#if showResumen}
				{#each EMPLOYEE_RESUMEN_COLUMNS as col}
					<th class="t-cell bg-gray-200 resumen">
						{col.label}
					</th>
				{/each}
			{/if}
			{#each COMPUTED_COLUMNS as col}
				<th class="t-cell {col.totalKey === 'grandTotal' ? 'sticky right-0 bg-gray-300' : 'bg-gray-200'}">{col.label}</th>
			{/each}
		</tr>
	</thead>
{/snippet}

{#snippet tableFooters()}
	<tfoot>
		<tr class="bg-gray-100">
			<td class="t-cell sticky left-0 bg-gray-300 font-bold">Total</td>
			{#each EMPLOYEE_COLUMNS.slice(1) as col}
				<td class="t-cell bg-gray-200 text-nowrap"></td>
			{/each}
			{#each EMPLOEYEE_WEEK_COLUMNS as col}
				<td class="t-cell bg-gray-200 text-nowrap">
					{formatMonetaryValue(totals.value.employeeWeekTotals.get(col.sumKey) ?? 0)}
				</td>
			{/each}
			{#each categoriesByType.value as [categoryType, categoriesInType]}
				{#each categoriesInType as category}
					{@const total = totals.value.categoryTotals.get(category.id) ?? {
						amount: 0,
						monetaryValue: 0
					}}
					<td class={`t-cell text-nowrap ${category.type}-opaco`}>
						<div class="flex items-center justify-center gap-1">
							<span class="text-sm text-gray-500">({total.amount})</span>
							{formatMonetaryValue(total.monetaryValue)}
						</div>
					</td>
				{/each}
				<td class={`t-cell text-nowrap ${categoryType}-opaco`}>
					{formatMonetaryValue(totals.value.categoryTypeGrandTotals.get(categoryType) ?? 0)}
				</td>
			{/each}
			{#if showResumen}
				{#each EMPLOYEE_RESUMEN_COLUMNS as col}
					{@const grandTotals = resumen.value.grandTotals}
					{@const value = grandTotals[col.key as keyof typeof grandTotals] ?? 0}
					<td class="t-cell bg-gray-200 resumen-opaco text-nowrap">
						{#if col.format === 'currency'}
							{formatMonetaryValue(value)}
						{:else}
							{value}
						{/if}
					</td>
				{/each}
			{/if}
			{#each COMPUTED_COLUMNS as col}
				<td class="t-cell {col.totalKey === 'grandTotal' ? 'sticky right-0 bg-gray-300' : 'bg-gray-200'} text-nowrap">
					{formatMonetaryValue((totals.value as any)[col.totalKey])}
				</td>
			{/each}
		</tr>
	</tfoot>
{/snippet}
