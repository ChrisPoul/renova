<script lang="ts">
	import { onMount } from 'svelte';
	import { totals } from '$lib/stores/totals.svelte';
	import { formatMonetaryValue } from '$lib/utils';

	let {
		employee,
		categoriasIncidencia
	}: { employee: Employee; categoriasIncidencia: CategoriaIncidencia[] } = $props();

	let categoriasIncidenciaMap = new Map<number, CategoriaIncidencia>(
		categoriasIncidencia.map((category) => [category.id, category])
	);
	let incidenciasMapByCategory = new Map<number, Incidencia>(
		employee.incidencias.map((incidencia) => [incidencia.category, incidencia])
	);

	onMount(() => {
		updateEmployeeTotalMonetaryValue();
		updateCategoryTotalMonetaryValues();
	});

	function getIncidenciaTotalMonetaryValue(amount: number, category: CategoriaIncidencia) {
		if (category.unit === 'días') {
			return (amount * employee.salary) / 5;
		}
		return amount * category.unitMonetaryValue;
	}
	function validateIncidenciaAmount(amount: number) {
		if (!amount) return amount;
		if (isNaN(amount)) return 0;
		if (amount < 0) return 0;

		const numString = amount.toString();
		const decimalIndex = numString.indexOf('.');
		if (decimalIndex === -1) {
			return amount;
		}
		const truncatedString = numString.slice(0, decimalIndex + 3);
		return parseFloat(truncatedString);
	}
	function updateIncidenciaAmount(incidencia: Incidencia) {
		incidencia.amount = validateIncidenciaAmount(incidencia.amount);
		updateEmployeeTotalMonetaryValue();
		updateCategoryTotalMonetaryValueByIncidencia(incidencia);
	}
	function updateEmployeeTotalMonetaryValue() {
		const total = getEmployeeTotalMonetaryValue(employee);
		totals.byEmployee.set(employee.id, total);
		totals.byEmployee = new Map(totals.byEmployee);
	}
	function getEmployeeTotalMonetaryValue(employee: Employee) {
		let total = 0;
		for (const incidencia of employee.incidencias) {
			const category = categoriasIncidenciaMap.get(incidencia.category);
			if (!category) continue
			if (category.type === 'deduccion') {
				total -= getIncidenciaTotalMonetaryValue(incidencia.amount, category);
			} else {
				total += getIncidenciaTotalMonetaryValue(incidencia.amount, category);
			}
		}
		return total;
	}
	function updateCategoryTotalMonetaryValues() {
		for (const incidencia of employee.incidencias) {
			updateCategoryTotalMonetaryValueByIncidencia(incidencia);
		}
	}
	function updateCategoryTotalMonetaryValueByIncidencia(incidencia: Incidencia) {
		const category = categoriasIncidenciaMap.get(incidencia.category);
		if (!category) return;
		let incidenciaTotalMonetaryValue = getIncidenciaTotalMonetaryValue(incidencia.amount, category);
		const categoryIncidencias = totals.byCategory.get(category.id);
		if (categoryIncidencias) {
			categoryIncidencias.set(employee.id, incidenciaTotalMonetaryValue);
		} else {
			totals.byCategory.set(
				incidencia.category,
				new Map([[employee.id, incidenciaTotalMonetaryValue]])
			);
		}
		totals.byCategory = new Map(totals.byCategory);
	}
</script>

<tr class="odd:bg-white even:bg-gray-50">
	<td class="border border-gray-300 px-4 py-2 text-nowrap">{employee.name}</td>
	<td class="border border-gray-300 px-4 py-2 text-nowrap"
		>{formatMonetaryValue(employee.salary)}</td
	>
	{#each categoriasIncidencia as category}
		{@const incidencia = incidenciasMapByCategory.get(category.id)}
		<td class="border border-gray-300 px-4 py-2 text-nowrap">
			{#if incidencia}
				<input
					type="number"
					step=".01"
					bind:value={incidencia.amount}
					class="w-15 rounded-md border border-gray-300 px-2 py-1"
					oninput={() => updateIncidenciaAmount(incidencia)}
				/>
				{category.unit}
				{#if category.unitMonetaryValue !== 1}
					<span class="pl-1 text-gray-500">
						{formatMonetaryValue(getIncidenciaTotalMonetaryValue(incidencia.amount, category))}
					</span>
				{/if}
			{/if}
		</td>
	{/each}
	<td class="border border-gray-300 px-4 py-2 text-nowrap">
		{formatMonetaryValue(totals.byEmployee.get(employee.id) ?? 0)}
	</td>
</tr>
