<script lang="ts">
	import EmployeeRow from './EmployeeRow.svelte';
	import { selectedCategoryTypes, totals } from '$lib/stores.svelte';
	import { formatMonetaryValue, getCategoryTypeLabel } from '$lib/utils';
	import EditCategory from './EditCategory.svelte';

	let {
		incidenceCategories,
		employees,
		getTotalSalary,
		getCategoryTotalMonetaryValueAndAmount,
		totalsByCategoryType
	}: {
		incidenceCategories: IncidenceCategory[];
		employees: Employee[];
		getTotalSalary: () => number;
		getCategoryTotalMonetaryValueAndAmount: (categoryId: number) => {
			monetaryValue: number;
			amount: number;
		};
		totalsByCategoryType: Map<string, number>;
	} = $props();
</script>

<div class="relative overflow-auto">
	<table class="m-2 border-collapse border border-gray-500">
		<thead>
			<tr class="bg-gray-100">
				<th class="t-cell sticky left-0 bg-gray-300">Empleado</th>
				<th class="t-cell bg-gray-200">Área</th>
				<th class="t-cell bg-gray-200">Puesto</th>
				<th class="t-cell bg-gray-200">Salario</th>
				{#each incidenceCategories as category}
					{#if selectedCategoryTypes.value.includes(category.type)}
						<th class={`t-cell ${category.type}`}>
							{category.concept}
							<span class="text-sm font-normal">
								{#if category.unitValueIsDerived || category.unit === '$'}
									{category.unit}
								{:else}
									{formatMonetaryValue(category.unitMonetaryValue)}
								{/if}
							</span>
							<EditCategory {category} />
						</th>
					{/if}
				{/each}
				{#each selectedCategoryTypes.value as categoryType}
					<th class={`t-cell ${categoryType}`}>
						Total {getCategoryTypeLabel(categoryType)}
					</th>
				{/each}
				<th class="t-cell sticky right-0 bg-gray-300">Total</th>
			</tr>
		</thead>
		<tbody>
			{#each employees as employee}
				<EmployeeRow {employee} {incidenceCategories} />
			{/each}
			<tr class="bg-gray-100">
				<td class="t-cell sticky left-0 bg-gray-300 font-bold">Total</td>
				<td class="t-cell bg-gray-200"></td>
				<td class="t-cell bg-gray-200"></td>
				<td class="t-cell bg-gray-200 text-nowrap">
					{formatMonetaryValue(getTotalSalary())}
				</td>
				{#each incidenceCategories as category}
					{#if selectedCategoryTypes.value.includes(category.type)}
						{@const total = getCategoryTotalMonetaryValueAndAmount(category.id)}
						<td class={`t-cell text-nowrap ${category.type}-opaco`}>
							<div class="flex items-center justify-center gap-1">
								<span class="text-sm text-gray-500">({total.amount})</span>
								{formatMonetaryValue(total.monetaryValue)}
							</div>
						</td>
					{/if}
				{/each}
				{#each selectedCategoryTypes.value as categoryType}
					<td class={`t-cell text-nowrap ${categoryType}-opaco`}>
						{formatMonetaryValue(totalsByCategoryType.get(categoryType) ?? 0)}
					</td>
				{/each}
				<td class="t-cell sticky right-0 bg-gray-300 text-nowrap">
					{formatMonetaryValue(totalsByCategoryType.get('all') ?? 0)}
				</td>
			</tr>
		</tbody>
	</table>
</div>
