<script lang="ts">
	import { selectedCategoryTypes, isReadOnly, incidenceCells } from '$lib/stores.svelte';
	import {
		formatMonetaryValue,
		validateAmount,
		getAndSetIncidenceTotal
	} from '$lib/utils';
	import EditIncidence from './EditIncidence.svelte';
	let {
		category,
		employee,
		incidence
	}: {
		category: IncidenceCategory;
		employee: Employee;
		incidence: Incidence;
	} = $props();
	let incidenceCell = $state(
		incidenceCells.value.get(incidence.categoryId)?.get(incidence.employeeId)
	);

	async function updateIncidence(incidence: Incidence, category: IncidenceCategory) {
		incidence.amount = validateAmount(incidence.amount);
		getAndSetIncidenceTotal(incidence, category, employee);
		incidenceCells.value = new Map(incidenceCells.value); // Trigger reactivity
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
		<div class="flex w-full items-center gap-0.75">
			{#if isReadOnly.value}
				{incidenceCell?.amount}
			{:else}
				<input
					type="number"
					step=".01"
					bind:value={incidence.amount}
					class="rounded-md border border-gray-500 px-2 py-1"
					oninput={() => {
						updateIncidence(incidence, category);
					}}
					style="width: {`${(incidence.amount?.toString().length || 1) + 4}ch`}; min-width: 8ch;"
				/>
			{/if}
			{incidenceCell?.unit}
			<div class="ml-auto flex flex-col">
				<div class="ml-auto flex items-center">
					<span class="text-sm leading-none text-gray-500">
						{formatMonetaryValue(incidenceCell?.unitMonetaryValue)}
					</span>
					{#if !isReadOnly.value}
						<EditIncidence bind:incidence {category} {updateIncidence} />
					{/if}
				</div>
				<span class="leading-none text-gray-500">
					{formatMonetaryValue(incidenceCell?.monetaryValue || 0)}
				</span>
			</div>
		</div>
	</td>
{/if}
