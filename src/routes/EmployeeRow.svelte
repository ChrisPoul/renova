<script lang="ts">
	import { onMount } from 'svelte';
	import { selectedCategoryTypes, totals, isReadOnly } from '$lib/stores.svelte';
	import {
		formatMonetaryValue,
		getEmployeeTotalFromCategoryTypeTotals,
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
		employee.incidences.map((incidence) => [incidence.categoryId, incidence])
	);

	onMount(() => {
		updateCategoryTotalMonetaryValuesByEmployee(employee);
		setEmployeeTotalsByCategoryType();
	});

	let employeeTotal = $derived.by(() => {
		return getEmployeeTotalFromCategoryTypeTotals(
			selectedCategoryTypes.value,
			employee.id,
			totals.categoryTypes
		);
	});

	async function updateIncidence(incidence: Incidence, category: IncidenceCategory) {
		incidence.amount = validateAmount(incidence.amount);
		getAndSetIncidenceTotal(incidence, category);
		setEmployeeTotalsByCategoryType();
		totals.incidences = new Map(totals.incidences);
		await fetch('/api/incidence', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: incidence.id,
				changes: {
					amount: incidence.amount,
					unit: incidence.unit,
					unitMonetaryValue: incidence.unitMonetaryValue,
					basedOnCategory: incidence.basedOnCategory,
					unitValueIsDerived: incidence.unitValueIsDerived
				}
			})
		});
	}

	function setEmployeeTotalsByCategoryType() {
		for (const categoryType of categoryTypes) {
			totals.categoryTypes.get(categoryType)?.set(employee.id, 0);
		}
		for (const incidence of employee.incidences) {
			const category = incidenceCategoriesMap.get(incidence.categoryId);
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

	function getAndSetIncidenceTotal(incidence: Incidence, category: IncidenceCategory) {
		let incidenciaTotalMonetaryValue = getIncidenceTotalMonetaryValue(
			incidence,
			category,
			employee
		);
		setIncidenceTotal(category.id, employee.id, incidence.amount, incidenciaTotalMonetaryValue);
	}

	function setIncidenceTotal(
		categoryId: number,
		employeeId: number,
		amount: number,
		incidenciaTotalMonetaryValue: number
	) {
		if (!totals.incidences.get(categoryId)) {
			totals.incidences.set(categoryId, new Map());
		}
		totals.incidences.get(categoryId)?.set(employeeId, {
			monetaryValue: incidenciaTotalMonetaryValue,
			amount: amount
		});
	}

	function updateCategoryTotalMonetaryValuesByEmployee(employee: Employee) {
		for (const incidence of employee.incidences) {
			const category = incidenceCategoriesMap.get(incidence.categoryId);
			if (!category) continue;
			getAndSetIncidenceTotal(incidence, category);
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
