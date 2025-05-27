<script lang="ts">
	import { onMount } from 'svelte';
	import { selectedCategoryTypes, totals } from '$lib/stores.svelte';
	import { formatMonetaryValue, getIncidenciaTotalMonetaryValue, validateAmount } from '$lib/utils';
	import { categoryTypes } from '$lib/constants';
	import IncidenciaCell from './IncidenciaCell.svelte';

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
		updateCategoryTotalMonetaryValuesByEmployee(employee);
		setEmployeeTotalsByCategoryType();
	});

	let employeeTotal = $derived.by(getEmployeeTotalByCategoryTypes);

	function getEmployeeTotalByCategoryTypes() {
		let total = 0;
		for (const categoryType of selectedCategoryTypes.value) {
			const categoryTypeTotal = totals.byCategoryType.get(categoryType)?.get(employee.id);
			if (!categoryTypeTotal) continue;
			if (categoryType === 'deduccion') {
				total -= categoryTypeTotal;
			} else {
				total += categoryTypeTotal;
			}
		}
		return total;
	}
	function updateIncidenciaAmount(incidencia: Incidencia, category: CategoriaIncidencia) {
		incidencia.amount = validateAmount(incidencia.amount);
		setEmployeeTotalsByCategoryType();
		setCategoryTotalByIncidencia(incidencia, category);
		totals.byCategory = new Map(totals.byCategory);
	}
	function setEmployeeTotalsByCategoryType() {
		for (const categoryType of categoryTypes) {
			totals.byCategoryType.get(categoryType)?.set(employee.id, 0);
		}
		for (const incidencia of employee.incidencias) {
			const category = categoriasIncidenciaMap.get(incidencia.category);
			if (!category) continue;
			let categoryTypeTotals = totals.byCategoryType.get(category.type);
			if (!categoryTypeTotals) {
				categoryTypeTotals = new Map([[employee.id, 0]]);
			}
			const incidenciaTotal = getIncidenciaTotalMonetaryValue(incidencia, category, employee);
			const prevTotal = categoryTypeTotals.get(employee.id) ?? 0;
			categoryTypeTotals.set(employee.id, prevTotal + incidenciaTotal);
			totals.byCategoryType.set(category.type, categoryTypeTotals);
		}
		totals.byCategoryType = new Map(totals.byCategoryType);
	}
	function updateCategoryTotalMonetaryValuesByEmployee(employee: Employee) {
		for (const incidencia of employee.incidencias) {
			const category = categoriasIncidenciaMap.get(incidencia.category);
			if (!category) continue;
			setCategoryTotalByIncidencia(incidencia, category);
		}
		totals.byCategory = new Map(totals.byCategory);
	}
	function setCategoryTotalByIncidencia(incidencia: Incidencia, category: CategoriaIncidencia) {
		let incidenciaTotalMonetaryValue = getIncidenciaTotalMonetaryValue(
			incidencia,
			category,
			employee
		);
		const categoryIncidencias = totals.byCategory.get(category.id);
		if (categoryIncidencias) {
			categoryIncidencias.set(employee.id, incidenciaTotalMonetaryValue);
		} else {
			totals.byCategory.set(
				incidencia.category,
				new Map([[employee.id, incidenciaTotalMonetaryValue]])
			);
		}
	}
</script>

<tr class="odd:bg-white even:bg-gray-50">
	<td class="t-cell sticky left-0 bg-gray-200 text-nowrap">{employee.name}</td>
	<td class="t-cell text-nowrap">{formatMonetaryValue(employee.salary)}</td>
	{#each categoriasIncidencia as category}
		<IncidenciaCell {category} {employee} {incidenciasMapByCategory} {updateIncidenciaAmount} />
	{/each}
	{#each selectedCategoryTypes.value as categoryType}
		<td class="t-cell text-nowrap">
			{formatMonetaryValue(totals.byCategoryType.get(categoryType)?.get(employee.id) ?? 0)}
		</td>
	{/each}
	<td class="t-cell sticky right-0 bg-gray-200 text-nowrap">
		{formatMonetaryValue(employeeTotal)}
	</td>
</tr>
