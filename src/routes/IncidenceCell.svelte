<script lang="ts">
	import { selectedCategoryTypes, isReadOnly, incidenceTotals } from '$lib/stores.svelte';
	import {
		formatMonetaryValue,
		getIncidenceUnitMonetaryValue,
		validateAmount
	} from '$lib/utils';
	import EditIncidence from './EditIncidence.svelte';
	import { onMount } from 'svelte';
	let {
		category,
		employee,
		incidenciasMapByCategory
	}: {
		category: IncidenceCategory;
		employee: Employee;
		incidenciasMapByCategory: Map<number, Incidence>;
	} = $props();
	let incidence = $derived(incidenciasMapByCategory.get(category.id));
	onMount(() => {
		if (incidence) {
			updateIncidence(incidence, category);
		}
	});

	async function updateIncidence(incidence: Incidence, category: IncidenceCategory) {
		incidence.amount = validateAmount(incidence.amount);
		getAndSetIncidenceTotal(incidence, category);
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
	function getAndSetIncidenceTotal(incidence: Incidence, category: IncidenceCategory) {
		let incidenciaTotalMonetaryValue = getIncidenceTotalMonetaryValue(
			incidence,
			category,
			employee
		);
		setIncidenceTotal(
			category.id,
			employee.id,
			incidence.amount,
			incidenciaTotalMonetaryValue,
			category.type
		);
	}
	function setIncidenceTotal(
		categoryId: number,
		employeeId: number,
		amount: number,
		monetaryValue: number,
		categoryType: string
	) {
		if (!incidenceTotals.value.get(categoryId)) {
			incidenceTotals.value.set(categoryId, new Map());
		}
		incidenceTotals.value.get(categoryId)?.set(employeeId, {
			monetaryValue: monetaryValue,
			amount: amount,
			categoryType: categoryType
		});
		incidenceTotals.value = new Map(incidenceTotals.value);
	}
	function getIncidenceTotalMonetaryValue(
		incidence: Incidence,
		category: IncidenceCategory,
		employee: Employee
	) {
		const unitMonetaryValue = getIncidenceUnitMonetaryValue(incidence, category, employee);
		return incidence.amount * unitMonetaryValue;
	}
</script>

{#if selectedCategoryTypes.value.includes(category.type)}
	<td class="t-cell text-nowrap">
		{#if incidence}
			<div class="flex w-full items-center gap-0.75">
				{#if isReadOnly.value}
					{incidenceTotals.value.get(incidence.categoryId)?.get(incidence.employeeId)?.amount}
				{:else}
					<input
						type="number"
						step=".01"
						bind:value={incidence.amount}
						class="rounded-md border border-gray-500 px-2 py-1"
						oninput={() => {
							if (!incidence) return;
							updateIncidence(incidence, category);
						}}
						style="width: {`${(incidence.amount?.toString().length || 1) + 4}ch`}; min-width: 8ch;"
					/>
				{/if}
				{#if incidence.basedOnCategory}
					{category.unit}
				{:else}
					{incidence.unit}
				{/if}
				<div class="ml-auto flex flex-col">
					<div class="ml-auto flex items-center">
						<span class="text-sm leading-none text-gray-500">
							{formatMonetaryValue(getIncidenceUnitMonetaryValue(incidence, category, employee))}
						</span>
						{#if !isReadOnly.value}
							<EditIncidence bind:incidence {category} {updateIncidence} />
						{/if}
					</div>
					<span class="leading-none text-gray-500">
						{formatMonetaryValue(
							incidenceTotals.value.get(incidence.categoryId)?.get(incidence.employeeId)
								?.monetaryValue || 0
						)}
					</span>
				</div>
			</div>
		{/if}
	</td>
{/if}
