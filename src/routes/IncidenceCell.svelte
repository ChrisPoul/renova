<script lang="ts">
	import { selectedCategoryTypes } from '$lib/stores.svelte';
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
		updateIncidenceAmount
	}: {
		category: IncidenceCategory;
		employee: Employee;
		incidenciasMapByCategory: Map<number, Incidence>;
		updateIncidenceAmount: (incidencia: Incidence, category: IncidenceCategory) => void;
	} = $props();
	let incidencia = $derived(incidenciasMapByCategory.get(category.id));
</script>

{#if selectedCategoryTypes.value.includes(category.type)}
	<td class="t-cell text-nowrap">
		{#if incidencia}
			<div class="flex w-full items-center gap-0.75">
				<input
					type="number"
					step=".01"
					bind:value={incidencia.amount}
					class="rounded-md border border-gray-500 px-2 py-1"
					oninput={() => {
						if (!incidencia) return;
						updateIncidenceAmount(incidencia, category);
					}}
					style="width: {`${(incidencia.amount?.toString().length || 1) + 4}ch`}; min-width: 8ch;"
				/>
				{#if incidencia.basedOnCategory}
					{category.unit}
				{:else}
					{incidencia.unit}
				{/if}
				<div class="ml-auto flex flex-col">
					<div class="ml-auto flex items-center">
						<span class="text-sm leading-none text-gray-500">
							{formatMonetaryValue(getIncidenceUnitMonetaryValue(incidencia, category, employee))}
						</span>
						<EditIncidence bind:incidencia {category} {updateIncidenceAmount} />
					</div>
					<span class="leading-none text-gray-500">
						{formatMonetaryValue(getIncidenceTotalMonetaryValue(incidencia, category, employee))}
					</span>
				</div>
			</div>
		{/if}
	</td>
{/if}
