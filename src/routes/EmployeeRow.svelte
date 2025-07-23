<script lang="ts">
	import { onMount } from 'svelte';
	import { selectedCategoryTypes, totals, isReadOnly } from '$lib/stores.svelte';
	import {
		formatMonetaryValue,
		getEmployeeTotalUsingCategoryTypes,
		getIncidenceTotalMonetaryValue,
		validateAmount
	} from '$lib/utils';
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

	let employeeTotal = $derived.by(() => {
		return getEmployeeTotalUsingCategoryTypes(
			selectedCategoryTypes.value,
			employee.id,
			totals.categoryTypes
		);
	});

	async function updateIncidence(incidencia: Incidence, category: IncidenceCategory) {
		incidencia.amount = validateAmount(incidencia.amount);
		setIncidenceTotal(incidencia, category);
		setEmployeeTotalsByCategoryType();
		totals.incidences = new Map(totals.incidences);
		await fetch('/api/incidence', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: incidencia.id,
				changes: {
					amount: incidencia.amount,
					unit: incidencia.unit,
					unitMonetaryValue: incidencia.unitMonetaryValue,
					basedOnCategory: incidencia.basedOnCategory,
					unitValueIsDerived: incidencia.unitValueIsDerived
				}
			})
		});
	}

	function setEmployeeTotalsByCategoryType() {
		for (const categoryType of categoryTypes) {
			totals.categoryTypes.get(categoryType)?.set(employee.id, 0);
		}
		for (const incidencia of employee.incidencias) {
			const category = incidenceCategoriesMap.get(incidencia.category);
			if (!category) continue;
			let categoryTypeTotals = totals.categoryTypes.get(category.type);
			if (!categoryTypeTotals) {
				categoryTypeTotals = new Map([[employee.id, 0]]);
			}
			const incidenciaTotal =
				totals.incidences.get(category.id)?.get(employee.id)?.monetaryValue ?? 0;
			const prevTotal = categoryTypeTotals.get(employee.id) ?? 0;
			const newTotal = prevTotal + incidenciaTotal;
			categoryTypeTotals.set(employee.id, newTotal);
			totals.categoryTypes.set(category.type, categoryTypeTotals);
		}
		totals.categoryTypes = new Map(totals.categoryTypes);
	}

	function setIncidenceTotal(incidencia: Incidence, category: IncidenceCategory) {
		let incidenciaTotalMonetaryValue = getIncidenceTotalMonetaryValue(
			incidencia,
			category,
			employee
		);
		if (!totals.incidences.get(category.id)) {
			totals.incidences.set(incidencia.category, new Map());
		}
		totals.incidences.get(category.id)?.set(employee.id, {
			monetaryValue: incidenciaTotalMonetaryValue,
			amount: incidencia.amount
		});
	}

	function updateCategoryTotalMonetaryValuesByEmployee(employee: Employee) {
		for (const incidencia of employee.incidencias) {
			const category = incidenceCategoriesMap.get(incidencia.category);
			if (!category) continue;
			setIncidenceTotal(incidencia, category);
		}
		totals.incidences = new Map(totals.incidences);
	}
</script>

<tr class="odd:bg-white even:bg-gray-50">
	<td class="t-cell sticky left-0 bg-gray-200 text-nowrap">
		{employee.name}
		{#if !isReadOnly.value}
			<EditEmployee {employee} />
		{/if}
	</td>
	<td class="t-cell text-nowrap">{employee.area}</td>
	<td class="t-cell text-nowrap">{employee.puesto}</td>
	<td class="t-cell text-nowrap">{formatMonetaryValue(employee.salary)}</td>
	{#each incidenceCategories as category}
		<IncidenceCell {category} {employee} {incidenciasMapByCategory} {updateIncidence} />
	{/each}
	{#each selectedCategoryTypes.value as categoryType}
		<td class="t-cell text-nowrap">
			{formatMonetaryValue(totals.categoryTypes.get(categoryType)?.get(employee.id) ?? 0)}
		</td>
	{/each}
	<td class="t-cell sticky right-0 bg-gray-200 text-nowrap">
		{formatMonetaryValue(employeeTotal)}
	</td>
</tr>
