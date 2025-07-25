<script lang="ts">
	import { incidenceCells, type IncidenceCell } from '$lib/stores.svelte';
	import { getIncidenceTotalMonetaryValue, setIncidenceCell } from '$lib/utils';
	import ModalMenu from './ModalMenu.svelte';
	import UnitInputs from './UnitInputs.svelte';

	let {
		categoryId,
		employeeId,
		incidenceCell
	}: {
		categoryId: number;
		employeeId: number;
		incidenceCell: IncidenceCell;
	} = $props();

	let unitMonetaryValue = $state(incidenceCell.unitMonetaryValue);
	let unit = $state(incidenceCell.unit);
	let unitValueIsDerived = $state(incidenceCell.unitValueIsDerived);

	async function acceptChanges() {
		const monetaryValue = getIncidenceTotalMonetaryValue(
			incidenceCell.amount,
			unitMonetaryValue
		);
		setIncidenceCell(incidenceCells.value, categoryId, employeeId, {
			...incidenceCell,
			unit,
			unitMonetaryValue,
			unitValueIsDerived,
			monetaryValue,
			basedOnCategory: false
		});
		incidenceCells.value = new Map(incidenceCells.value); // Trigger reactivity
		await fetch('/api/incidence', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: incidenceCell.incidenceId,
				changes: {
					unit: unit,
					unitMonetaryValue: unitMonetaryValue,
					unitValueIsDerived: unitValueIsDerived,
					basedOnCategory: false
				}
			})
		});
	}
</script>

<ModalMenu title="Editar Unidad" onAccept={acceptChanges}>
	<div class="flex flex-col gap-2">
		<UnitInputs bind:unit bind:unitMonetaryValue bind:unitValueIsDerived />
	</div>
	{#snippet triggerButton()}
		<img class="ml-0.5 w-4 bg-white" src="/EditIcon.svg" alt="" />
	{/snippet}
</ModalMenu>
