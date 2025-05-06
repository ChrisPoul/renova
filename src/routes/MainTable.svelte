<script lang="ts">
	import EmployeeRow from './EmployeeRow.svelte';
	import { totals } from '$lib/stores/totals.svelte';
	import { formatMonetaryValue } from '$lib/utils';

	let { categoriasIncidencia, employees, selectedParentCategories } = $props();

	let totalMonetaryValue = $derived.by(getTotalMonetaryValueByEmployees);

	function getTotalSalary() {
		let total = 0;
		for (const employee of employees) {
			total += employee.salary;
		}
		return total;
	}
	function getTotalMonetaryValueByEmployees() {
		let total = 0;
		for (const [employeeId, employeeTotal] of totals.byEmployee) {
			total += employeeTotal;
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
</script>

<div class="relative overflow-auto">
	<table class="m-2 border-collapse border border-gray-500">
		<thead>
			<tr class="bg-gray-100">
				<th class="sticky left-0 border border-gray-500 bg-gray-300 px-4 py-2">Empleado</th>
				<th class="border border-gray-500 bg-gray-300 px-4 py-2">Salario</th>
				{#each categoriasIncidencia as category}
					{#if selectedParentCategories.includes(category.parentCategory)}
						<th class={`border border-gray-700 px-4 py-2 text-nowrap ${category.parentCategory}`}>
							{category.concept}
							{#if category.unitMonetaryValue !== 1}
								<span class="pl-1 text-sm font-normal">
									{formatMonetaryValue(category.unitMonetaryValue)}
								</span>
							{/if}
						</th>
					{/if}
				{/each}
				<th class="sticky right-0 border border-gray-500 bg-gray-300 px-4 py-2">Total</th>
			</tr>
		</thead>
		<tbody>
			{#each employees as employee}
				<EmployeeRow {employee} {categoriasIncidencia} {selectedParentCategories} />
			{/each}
			<tr class="bg-gray-100">
				<td class="sticky left-0 border border-gray-500 bg-gray-300 px-4 py-2 font-bold">Total</td>
				<td class="border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap">
					{formatMonetaryValue(getTotalSalary())}
				</td>
				{#each categoriasIncidencia as category}
					{#if selectedParentCategories.includes(category.parentCategory)}
						<td class="border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap">
							{formatMonetaryValue(getCategoryTotalMonetaryValue(category.id))}
						</td>
					{/if}
				{/each}
				<td class="sticky right-0 border border-gray-500 bg-gray-300 px-4 py-2 text-nowrap">
					{formatMonetaryValue(totalMonetaryValue)}
				</td>
			</tr></tbody
		>
	</table>
</div>
