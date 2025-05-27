<script lang="ts">
	import { selectedCategoryTypes } from '$lib/stores.svelte';
	import {
		formatMonetaryValue,
		getIncidenciaTotalMonetaryValue,
		getIncidenciaUnitMonetaryValue,
	} from '$lib/utils';
	import EditIncidencia from './EditIncidencia.svelte';
	let {
		category,
		employee,
		incidenciasMapByCategory,
		updateIncidenciaAmount
	}: {
		category: CategoriaIncidencia;
		employee: Employee;
		incidenciasMapByCategory: Map<number, Incidencia>;
		updateIncidenciaAmount: (incidencia: Incidencia, category: CategoriaIncidencia) => void;
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
						updateIncidenciaAmount(incidencia, category);
					}}
					style="width: {`${(incidencia.amount?.toString().length || 1) + 4}ch`}; min-width: 8ch;"
				/>
				{#if incidencia.unit}
					{incidencia.unit}
				{:else}
					{category.unit}
				{/if}
				{#if category.unitMonetaryValue !== 1}
					<div class="ml-auto flex flex-col">
						<div class="ml-auto flex items-center">
							<span class="text-sm leading-none text-gray-500">
								{formatMonetaryValue(
									getIncidenciaUnitMonetaryValue(incidencia, category, employee)
								)}
							</span>
							<EditIncidencia bind:incidencia {category} {updateIncidenciaAmount} />
						</div>
						<span class="leading-none text-gray-500">
							{formatMonetaryValue(getIncidenciaTotalMonetaryValue(incidencia, category, employee))}
						</span>
					</div>
				{/if}
			</div>
		{/if}
	</td>
{/if}
