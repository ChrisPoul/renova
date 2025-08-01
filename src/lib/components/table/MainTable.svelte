<script lang="ts">
	import EmployeeRow from '$lib/components/table/EmployeeRow.svelte';
	import { isReadOnly, totals, employees, categoriesByType } from '$lib/stores.svelte';
	import { formatMonetaryValue, getCategoryTypeLabel } from '$lib/utils';
	import EditCategory from '$lib/components/categories/EditCategory.svelte';

	function getTotalSalary() {
		let total = 0;
		for (const [_, employee] of employees.value) {
			total += employee.salary;
		}
		return total;
	}
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
			<th class="t-cell sticky left-0 bg-gray-300">Empleado</th>
			<th class="t-cell bg-gray-200">Área</th>
			<th class="t-cell bg-gray-200">Puesto</th>
			<th class="t-cell bg-gray-200">Salario</th>
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
			<th class="t-cell sticky right-0 bg-gray-300">Total</th>
		</tr>
	</thead>
{/snippet}

{#snippet tableFooters()}
	<tfoot>
		<tr class="bg-gray-100">
			<td class="t-cell sticky left-0 bg-gray-300 font-bold">Total</td>
			<td class="t-cell bg-gray-200"></td>
			<td class="t-cell bg-gray-200"></td>
			<td class="t-cell bg-gray-200 text-nowrap">
				{formatMonetaryValue(getTotalSalary())}
			</td>
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
			<td class="t-cell sticky right-0 bg-gray-300 text-nowrap">
				{formatMonetaryValue(totals.value.grandTotal)}
			</td>
		</tr>
	</tfoot>
{/snippet}
