<script lang="ts">
	import { selectedCategoryTypes, isReadOnly, incidenceTotals } from '$lib/stores.svelte';
	import {
		formatMonetaryValue,
		getIncidenceUnitMonetaryValue,
		validateAmount,
		getAndSetIncidenceTotal
	} from '$lib/utils';
	import EditIncidence from './EditIncidence.svelte';
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

	async function updateIncidence(incidence: Incidence, category: IncidenceCategory) {
		incidence.amount = validateAmount(incidence.amount);
		getAndSetIncidenceTotal(incidence, category, employee);
		incidenceTotals.value = new Map(incidenceTotals.value); // Trigger reactivity
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
