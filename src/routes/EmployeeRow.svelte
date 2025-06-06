<script lang="ts">
	import { onMount } from 'svelte';
	import { selectedCategoryTypes, totals } from '$lib/stores.svelte';
	import { formatMonetaryValue, getIncidenceTotalMonetaryValue, validateAmount } from '$lib/utils';
	import { categoryTypes } from '$lib/constants';
	import IncidenceCell from './IncidenceCell.svelte';
	import EditEmployee from './EditEmployee.svelte';

	let {
		employee,
		incidenceCategories
	}: {
		employee: Employee;
		incidenceCategories: IncidenceCategory[];
	} = $props();

	let incidenceCategoriesMap = new Map<number, IncidenceCategory>(
		incidenceCategories.map((category) => [category.id, category])
	);
	let incidenciasMapByCategory = new Map<number, Incidence>(
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
	async function updateIncidenceAmount(incidencia: Incidence, category: IncidenceCategory) {
		incidencia.amount = validateAmount(incidencia.amount);
		setEmployeeTotalsByCategoryType();
		setCategoryTotalByIncidence(incidencia, category);
		totals.byCategory = new Map(totals.byCategory);
		await fetch('/api/incidence', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: incidencia.id,
				amount: incidencia.amount,
				unit: incidencia.unit,
				unitMonetaryValue: incidencia.unitMonetaryValue
			})
		});
	}

	function setEmployeeTotalsByCategoryType() {
		for (const categoryType of categoryTypes) {
			totals.byCategoryType.get(categoryType)?.set(employee.id, 0);
		}
		for (const incidencia of employee.incidencias) {
			const category = incidenceCategoriesMap.get(incidencia.category);
			if (!category) continue;
			let categoryTypeTotals = totals.byCategoryType.get(category.type);
			if (!categoryTypeTotals) {
				categoryTypeTotals = new Map([[employee.id, 0]]);
			}
			const incidenciaTotal = getIncidenceTotalMonetaryValue(incidencia, category, employee);
			const prevTotal = categoryTypeTotals.get(employee.id) ?? 0;
			categoryTypeTotals.set(employee.id, prevTotal + incidenciaTotal);
			totals.byCategoryType.set(category.type, categoryTypeTotals);
		}
		totals.byCategoryType = new Map(totals.byCategoryType);
	}
	function updateCategoryTotalMonetaryValuesByEmployee(employee: Employee) {
		for (const incidencia of employee.incidencias) {
			const category = incidenceCategoriesMap.get(incidencia.category);
			if (!category) continue;
			setCategoryTotalByIncidence(incidencia, category);
		}
		totals.byCategory = new Map(totals.byCategory);
	}
	function setCategoryTotalByIncidence(incidencia: Incidence, category: IncidenceCategory) {
		let incidenciaTotalMonetaryValue = getIncidenceTotalMonetaryValue(
			incidencia,
			category,
			employee
		);
		const categoryIncidences = totals.byCategory.get(category.id);
		if (categoryIncidences) {
			categoryIncidences.set(employee.id, incidenciaTotalMonetaryValue);
		} else {
			totals.byCategory.set(
				incidencia.category,
				new Map([[employee.id, incidenciaTotalMonetaryValue]])
			);
		}
	}
</script>

<tr class="odd:bg-white even:bg-gray-50">
	<td class="t-cell sticky left-0 bg-gray-200 text-nowrap">
		{employee.name}
		<EditEmployee {employee} />
	</td>
	<td class="t-cell text-nowrap">{employee.area}</td>
	<td class="t-cell text-nowrap">{employee.puesto}</td>
	<td class="t-cell text-nowrap">{formatMonetaryValue(employee.salary)}</td>
	{#each incidenceCategories as category}
		<IncidenceCell {category} {employee} {incidenciasMapByCategory} {updateIncidenceAmount} />
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
