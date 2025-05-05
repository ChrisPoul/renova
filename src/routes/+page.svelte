<script lang="ts">
	import EmployeeRow from './EmployeeRow.svelte';
	import { totals } from '$lib/stores/totals.svelte';
	import { formatMonetaryValue } from '$lib/utils';

	let incidencias = 0;
	let categoriasIncidencia = [
		{ id: 1, concept: 'Puertas Grandes', unit: '', unitMonetaryValue: 12 },
		{ id: 2, concept: 'Corte Junke', unit: 'kg', unitMonetaryValue: 20 }
	];
	let totalMonetaryValue = $derived.by(getTotalMonetaryValueByEmployees);

	let employees = $state([
		{
			id: 1,
			name: 'John Doe',
			incidencias: [
				{ id: 1, category: 1, amount: 100 },
				{ id: 2, category: 2, amount: 15 }
			]
		},
		{
			id: 2,
			name: 'Jane Smith',
			incidencias: [
				{ id: 3, category: 1, amount: 120 },
				{ id: 4, category: 2, amount: 20 }
			]
		}
	]);
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

<table class="w-auto table-auto border-collapse border border-gray-300">
	<thead>
		<tr class="bg-gray-100">
			<th class="border border-gray-300 px-4 py-2">Empleado</th>
			{#each categoriasIncidencia as category}
				<th class="border border-gray-300 px-4 py-2">
					{category.concept}
					<span class="pl-1 text-sm font-normal">
						{formatMonetaryValue(category.unitMonetaryValue)}
					</span>
				</th>
			{/each}
			<th class="border border-gray-300 px-4 py-2">Total</th>
		</tr>
	</thead>
	<tbody>
		{#each employees as employee}
			<EmployeeRow {employee} {categoriasIncidencia} />
		{/each}
		<tr class="bg-gray-100">
			<td class="border border-gray-300 px-4 py-2">Total</td>
			{#each categoriasIncidencia as category}
				<td class="border border-gray-300 px-4 py-2">
					{formatMonetaryValue(getCategoryTotalMonetaryValue(category.id))}
				</td>
			{/each}
			<td class="border border-gray-300 px-4 py-2">
				{formatMonetaryValue(totalMonetaryValue)}
			</td>
		</tr></tbody
	>
</table>
