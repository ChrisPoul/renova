<script lang="ts">
	import { onMount } from 'svelte';
	import { selectedCategoryTypes, totals } from '$lib/stores.svelte';
	import { formatMonetaryValue } from '$lib/utils';

	let {
		employee,
		categoriasIncidencia
	}: {
		employee: Employee;
		categoriasIncidencia: CategoriaIncidencia[];
	} = $props();

	let categoriasIncidenciaMap = new Map<number, CategoriaIncidencia>(
		categoriasIncidencia.map((category) => [category.id, category])
	);
	let incidenciasMapByCategory = new Map<number, Incidencia>(
		employee.incidencias.map((incidencia) => [incidencia.category, incidencia])
	);

	onMount(() => {
		updateEmployeeTotalMonetaryValue(employee);
		updateCategoryTotalMonetaryValuesByEmployee(employee);
	});

	function getIncidenciaTotalMonetaryValue(amount: number, category: CategoriaIncidencia) {
		if (category.unit === 'días') {
			return (amount * employee.salary) / 5;
		} else if (category.unit === 'horas') {
			return (amount * employee.salary) / 40;
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
		updateEmployeeTotalMonetaryValue(employee);
		updateCategoryTotalMonetaryValueByIncidencia(incidencia);
	}
	function updateEmployeeTotalMonetaryValue(employee: Employee) {
		const { total, categoryTypeTotals } = getEmployeeTotalMonetaryValue(employee);
		totals.byEmployee.set(employee.id, total);
		totals.byEmployee = new Map(totals.byEmployee);
		for (const [categoryType, categoryTypeTotal] of categoryTypeTotals) {
			const categoryTypeTotalsByEmployee = totals.byCategoryType.get(categoryType);
			if (categoryTypeTotalsByEmployee) {
				categoryTypeTotalsByEmployee.set(employee.id, categoryTypeTotal);
			} else {
				totals.byCategoryType.set(categoryType, new Map([[employee.id, categoryTypeTotal]]));
			}
		}
		totals.byCategoryType = new Map(totals.byCategoryType);
	}
	function getEmployeeTotalMonetaryValue(employee: Employee) {
		let total = 0;
		const categoryTypeTotals = new Map<CategoryType, number>();
		for (const incidencia of employee.incidencias) {
			const category = categoriasIncidenciaMap.get(incidencia.category);
			if (!category) continue;
			if (!selectedCategoryTypes.value.includes(category.type)) continue;
			const incidenciaTotalMonetaryValue = getIncidenciaTotalMonetaryValue(
				incidencia.amount,
				category
			);
			if (category.type === 'deduccion') {
				total -= incidenciaTotalMonetaryValue;
			} else {
				total += incidenciaTotalMonetaryValue;
			}
			categoryTypeTotals.set(
				category.type,
				(categoryTypeTotals.get(category.type) ?? 0) + incidenciaTotalMonetaryValue
			);
		}
		return { total, categoryTypeTotals };
	}
	function updateCategoryTotalMonetaryValuesByEmployee(employee: Employee) {
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
	<td class="sticky left-0 border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap"
		>{employee.name}</td
	>
	<td class="border border-gray-500 px-4 py-2 text-nowrap"
		>{formatMonetaryValue(employee.salary)}</td
	>
	{#each categoriasIncidencia as category}
		{#if selectedCategoryTypes.value.includes(category.type)}
			{@const incidencia = incidenciasMapByCategory.get(category.id)}
			<td class="border border-gray-500 px-4 py-2 text-nowrap">
				{#if incidencia}
					<input
						type="number"
						step=".01"
						bind:value={incidencia.amount}
						class="w-15 rounded-md border border-gray-500 px-2 py-1"
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
		{/if}
	{/each}
	{#each selectedCategoryTypes.value as categoryType}
		<td class="border border-gray-500 px-4 py-2 text-nowrap">
			{formatMonetaryValue(totals.byCategoryType.get(categoryType)?.get(employee.id) ?? 0)}
		</td>
	{/each}
	<td class="sticky right-0 border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap">
		{formatMonetaryValue(totals.byEmployee.get(employee.id) ?? 0)}
	</td>
</tr>
