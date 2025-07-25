<script lang="ts">
	import { isReadOnly, incidenceCells, type IncidenceCell } from '$lib/stores.svelte';
	import { formatMonetaryValue, validateAmount, getIncidenceTotalMonetaryValue } from '$lib/utils';
	import EditIncidence from './EditIncidence.svelte';
	let {
		categoryId,
		employeeId
	}: {
		categoryId: number;
		employeeId: number;
	} = $props();
	let incidenceCell = $derived(incidenceCells.value.get(categoryId)?.get(employeeId));
	let incidenceAmount = $derived(incidenceCell?.amount || 0);

	async function updateIncidenceAmount() {
		if (!incidenceCell) return;
		incidenceAmount = validateAmount(incidenceAmount);
		incidenceCell.amount = incidenceAmount;
		incidenceCell.monetaryValue = getIncidenceTotalMonetaryValue(
			incidenceAmount,
			incidenceCell.unitMonetaryValue
		);
		incidenceCells.value = new Map(incidenceCells.value); // Trigger reactivity
		await fetch('/api/incidence', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: incidenceCell.incidenceId,
				changes: {
					amount: incidenceAmount
				}
			})
		});
	}
</script>

<td class="t-cell text-nowrap">
	<div class="flex w-full items-center gap-0.75">
		{#if isReadOnly.value}
			{incidenceCell?.amount}
		{:else}
			<input
				type="number"
				step=".01"
				bind:value={incidenceAmount}
				class="rounded-md border border-gray-500 px-2 py-1"
				oninput={() => {
					updateIncidenceAmount();
				}}
				style="width: {`${(incidenceCell?.amount.toString().length || 1) + 4}ch`}; min-width: 8ch;"
			/>
		{/if}
		{incidenceCell?.unit}
		<div class="ml-auto flex flex-col">
			<div class="ml-auto flex items-center">
				<span class="text-sm leading-none text-gray-500">
					{formatMonetaryValue(incidenceCell?.unitMonetaryValue)}
				</span>
				{#if !isReadOnly.value}
					{#if incidenceCell}
						<EditIncidence {incidenceCell} />
					{/if}
				{/if}
			</div>
			<span class="leading-none text-gray-500">
				{formatMonetaryValue(
					incidenceCells.value.get(categoryId)?.get(employeeId)?.monetaryValue || 0
				)}
			</span>
		</div>
	</div>
</td>
