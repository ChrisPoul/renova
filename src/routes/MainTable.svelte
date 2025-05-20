<script lang="ts">
	import EmployeeRow from './EmployeeRow.svelte';
	import { selectedCategoryTypes, totals } from '$lib/stores.svelte';
	import { formatMonetaryValue, getCategoryTypeLabel } from '$lib/utils';
	import * as XLSX from 'xlsx';
	import { categoryTypes } from '$lib/constants';

	let {
		categoriasIncidencia,
		employees
	}: {
		categoriasIncidencia: CategoriaIncidencia[];
		employees: Employee[];
	} = $props();

	let totalsByCategoryType = $derived.by(getTotalsByCategoryType);

	function getTotalSalary() {
		let total = 0;
		for (const employee of employees) {
			total += employee.salary;
		}
		return total;
	}
	function getTotalsByCategoryType() {
		const totalsByCategoryType = new Map<string, number>([['all', 0]]);
		for (const categoryType of selectedCategoryTypes.value) {
			const categoryTypeTotal = getCategoryTypeTotalMonetaryValue(categoryType);
			totalsByCategoryType.set(categoryType, categoryTypeTotal);
			const prevTotal = totalsByCategoryType.get('all') ?? 0;
			if (categoryType === 'deduccion') {
				totalsByCategoryType.set('all', prevTotal - categoryTypeTotal);
			} else {
				totalsByCategoryType.set('all', prevTotal + categoryTypeTotal);
			}
		}

		return totalsByCategoryType;
	}
	function getCategoryTypeTotalMonetaryValue(categoryType: CategoryType) {
		let total = 0;
		const categoryTypeTotals = totals.byCategoryType.get(categoryType);
		if (!categoryTypeTotals) return 0;
		for (const [employeeId, employeeCategoryTypeTotal] of categoryTypeTotals) {
			total += employeeCategoryTypeTotal;
		}
		return total;
	}
	function getCategoryTotalMonetaryValue(categoryId: number) {
		let total = 0;
		const incidenciaTotals = totals.byCategory.get(categoryId);
		if (!incidenciaTotals) return 0;
		for (const [employeeId, incidenciaTotal] of incidenciaTotals) {
			total += incidenciaTotal;
		}
		return total;
	}
	function generateExcelReport() {
		return undefined;
	}
</script>

<div class="relative overflow-auto">
	<table class="m-2 border-collapse border border-gray-500">
		<thead>
			<tr class="bg-gray-100">
				<th class="sticky left-0 border border-gray-500 bg-gray-300 px-4 py-2">Empleado</th>
				<th class="border border-gray-500 bg-gray-300 px-4 py-2">Salario</th>
				{#each categoriasIncidencia as category}
					{#if selectedCategoryTypes.value.includes(category.type)}
						<th class={`border border-gray-700 px-4 py-2 text-nowrap ${category.type}`}>
							{category.concept}
							{#if category.unitMonetaryValue !== 1 && category.unitMonetaryValue !== 0}
								<span class="pl-1 text-sm font-normal">
									{formatMonetaryValue(category.unitMonetaryValue)}
								</span>
							{/if}
						</th>
					{/if}
				{/each}
				{#each selectedCategoryTypes.value as categoryType}
					<th class={`border border-gray-700 px-4 py-2 text-nowrap ${categoryType}`}>
						Total {getCategoryTypeLabel(categoryType)}
					</th>
				{/each}
				<th class="sticky right-0 border border-gray-500 bg-gray-300 px-4 py-2">Total</th>
			</tr>
		</thead>
		<tbody>
			{#each employees as employee}
				<EmployeeRow {employee} {categoriasIncidencia} />
			{/each}
			<tr class="bg-gray-100">
				<td class="sticky left-0 border border-gray-500 bg-gray-300 px-4 py-2 font-bold">Total</td>
				<td class="border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap">
					{formatMonetaryValue(getTotalSalary())}
				</td>
				{#each categoriasIncidencia as category}
					{#if selectedCategoryTypes.value.includes(category.type)}
						<td
							class={`border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap ${category.type}-opaco`}
						>
							{formatMonetaryValue(getCategoryTotalMonetaryValue(category.id))}
						</td>
					{/if}
				{/each}
				{#each selectedCategoryTypes.value as categoryType}
					<td
						class={`border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap ${categoryType}-opaco`}
					>
						{formatMonetaryValue(totalsByCategoryType.get(categoryType) ?? 0)}
					</td>
				{/each}
				<td class="sticky right-0 border border-gray-500 bg-gray-300 px-4 py-2 text-nowrap">
					{formatMonetaryValue(totalsByCategoryType.get('all') ?? 0)}
				</td>
			</tr>
		</tbody>
	</table>
</div>

<button
	class="mb-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
	onclick={generateExcelReport}
>
	Generar Reporte
</button>
