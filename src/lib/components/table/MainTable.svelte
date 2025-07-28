<script lang="ts">
	import EmployeeRow from '$lib/components/table/EmployeeRow.svelte';
	import {
		selectedCategoryTypes,
		isReadOnly,
		totals,
		employees,
		categories
	} from '$lib/stores.svelte';
	import { formatMonetaryValue, getCategoryTypeLabel } from '$lib/utils';
	import EditCategory from '$lib/components/categories/EditCategory.svelte';

	const categoriesByType = $derived.by(() => {
		const categoriesByType = new Map<CategoryType, Category[]>(
			selectedCategoryTypes.value.map((categoryType) => [categoryType, []])
		);
		for (const category of categories.value.values()) {
			if (!selectedCategoryTypes.value.includes(category.type)) continue;
			let categoriesInType = categoriesByType.get(category.type);
			if (categoriesInType === undefined) {
				categoriesInType = [];
			}
			categoriesInType.push(category);
			categoriesByType.set(category.type, categoriesInType);
		}
		return categoriesByType;
	});

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
		<thead>
			<tr class="bg-gray-100">
				<th class="t-cell sticky left-0 bg-gray-300">Empleado</th>
				<th class="t-cell bg-gray-200">Área</th>
				<th class="t-cell bg-gray-200">Puesto</th>
				<th class="t-cell bg-gray-200">Salario</th>
				{#each categoriesByType as [categoryType, categoriesInType]}
					{#each categoriesInType as category}
						<th class={`t-cell ${category.type}`}>
							{category.concept}
							<span class="text-sm font-normal">
								{#if category.unitValueIsDerived || category.unit === '$'}
									{category.unit}
								{:else}
									{formatMonetaryValue(category.unitMonetaryValue)}
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
		<tbody>
			{#each employees.value as [_, employee]}
				<EmployeeRow {employee} {categoriesByType} />
			{/each}
			<tr class="bg-gray-100">
				<td class="t-cell sticky left-0 bg-gray-300 font-bold">Total</td>
				<td class="t-cell bg-gray-200"></td>
				<td class="t-cell bg-gray-200"></td>
				<td class="t-cell bg-gray-200 text-nowrap">
					{formatMonetaryValue(getTotalSalary())}
				</td>
				{#each categoriesByType as [categoryType, categoriesInType]}
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
		</tbody>
	</table>
</div>