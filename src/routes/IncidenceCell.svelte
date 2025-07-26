<script lang="ts">
	import { isReadOnly, incidenceCells, type IncidenceCell } from '$lib/stores.svelte';
	import {
		formatMonetaryValue,
		validateAmount,
		getIncidenceCellTotalMonetaryValue,
		setIncidenceCell
	} from '$lib/utils';
	import EditIncidence from './EditIncidence.svelte';
	let {
		categoryId,
		employeeId
	}: {
		categoryId: number;
		employeeId: number;
	} = $props();
	let incidenceCell = $derived(incidenceCells.value.get(categoryId)?.get(employeeId));
	let incidenceAmount = $derived(
		incidenceCell?.incidence.amount === undefined ? null : incidenceCell.incidence.amount
	);

	async function updateIncidenceAmount() {
		if (!incidenceCell) return;
		incidenceAmount = validateAmount(incidenceAmount);
		if (incidenceAmount === null) return;
		const totalMonetaryValue = getIncidenceCellTotalMonetaryValue(
			incidenceAmount,
			incidenceCell.incidence.unitMonetaryValue
		);
		setIncidenceCell(incidenceCells.value, categoryId, employeeId, {
			...incidenceCell,
			incidence: { ...incidenceCell.incidence, amount: incidenceAmount },
			totalMonetaryValue
		});
		incidenceCells.value = new Map(incidenceCells.value); // Trigger reactivity
		await fetch('/api/incidence', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: incidenceCell.incidence.id,
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
			{incidenceCell?.incidence.amount}
		{:else}
			<input
				type="number"
				step=".01"
				bind:value={incidenceAmount}
				class="rounded-md border border-gray-500 px-2 py-1"
				oninput={() => {
					updateIncidenceAmount();
				}}
				style="width: {`${(incidenceCell?.incidence.amount?.toString().length || 1) + 4}ch`}; min-width: 8ch;"
			/>
		{/if}
		{incidenceCell?.incidence.unit}
		<div class="ml-auto flex flex-col">
			<div class="ml-auto flex items-center">
				<span class="text-sm leading-none text-gray-500">
					{formatMonetaryValue(incidenceCell?.incidence.unitMonetaryValue)}
				</span>
				{#if !isReadOnly.value}
					{#if incidenceCell}
						<EditIncidence {categoryId} {employeeId} {incidenceCell} />
					{/if}
				{/if}
			</div>
			<span class="leading-none text-gray-500">
				{formatMonetaryValue(incidenceCell?.totalMonetaryValue || 0)}
			</span>
		</div>
	</div>
</td>
