<script lang="ts">
	import EmployeeRow from './EmployeeRow.svelte';
	import {totals} from '$lib/stores/totals.svelte';

	let categoriasDestajo = [
		{ id: 1, concept: 'Puertas Grandes', unit: '', unitMonetaryValue: 12 },
		{ id: 2, concept: 'Corte Junke', unit: 'kg', unitMonetaryValue: 20 }
	];
	let totalMonetaryValue = $derived.by(getTotalMonetaryValueByEmployees);

	let employees = $state([
		{
			id: 1,
			name: 'John Doe',
			destajos: [
				{ id: 1, category: 1, amount: 100 },
				{ id: 2, category: 2, amount: 15 }
			]
		},
		{
			id: 2,
			name: 'Jane Smith',
			destajos: [
				{ id: 3, category: 1, amount: 120 },
				{ id: 4, category: 2, amount: 20 }
			]
		}
	]);
	function formatNumber(value: number) {
		return value.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}
	function getTotalMonetaryValueByEmployees() {
		let total = 0
		for (const [employeeId, employeeTotal] of totals.byEmployee) {
			total += employeeTotal
		}
		return total
	}
	function getCategoryTotalMonetaryValue(categoryId: number) {
		let total = 0
		const destajoTotals = totals.byCategory.get(categoryId)
		if (!destajoTotals) return 0
		for (const [destajoId, destajoTotal] of destajoTotals) {
			total += destajoTotal
		}
		return total
	}
</script>

<table class="w-auto table-auto border-collapse border border-gray-300">
	<thead>
		<tr class="bg-gray-100">
			<th class="border border-gray-300 px-4 py-2">Empleado</th>
			{#each categoriasDestajo as category}
				<th class="border border-gray-300 px-4 py-2">
					{category.concept}
				</th>
			{/each}
			<th class="border border-gray-300 px-4 py-2">Total</th>
		</tr>
	</thead>
	<tbody>
		{#each employees as employee}
			<EmployeeRow {employee} {categoriasDestajo} />
		{/each}
		<tr class="bg-gray-100">
			<td class="border border-gray-300 px-4 py-2">Total</td>
			{#each categoriasDestajo as category}
				<td class="border border-gray-300 px-4 py-2">
					{formatNumber(getCategoryTotalMonetaryValue(category.id))}
				</td>
			{/each}
			<td class="border border-gray-300 px-4 py-2">
				{formatNumber(totalMonetaryValue)}
			</td>
		</tr></tbody
	>
</table>
