<script lang="ts">
	import { selectedCategoryTypes, isReadOnly, totals } from '$lib/stores.svelte';
	import {
		formatMonetaryValue,
		getIncidenceTotalMonetaryValue,
		getIncidenceUnitMonetaryValue
	} from '$lib/utils';
	import EditIncidence from './EditIncidence.svelte';
	let {
		category,
		employee,
		incidenciasMapByCategory,
		updateIncidence
	}: {
		category: IncidenceCategory;
		employee: Employee;
		incidenciasMapByCategory: Map<number, Incidence>;
		updateIncidence: (incidence: Incidence, category: IncidenceCategory) => void;
	} = $props();
	let incidence = $derived(incidenciasMapByCategory.get(category.id));
</script>

{#if selectedCategoryTypes.value.includes(category.type)}
	<td class="t-cell text-nowrap">
		{#if incidence}
			<div class="flex w-full items-center gap-0.75">
				{#if isReadOnly.value}
					{totals.incidences.get(incidence.category)?.get(incidence.employee)?.amount}
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
						{formatMonetaryValue(getIncidenceTotalMonetaryValue(incidence, category, employee))}
					</span>
				</div>
			</div>
		{/if}
	</td>
{/if}
