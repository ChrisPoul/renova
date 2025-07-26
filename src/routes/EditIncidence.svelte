<script lang="ts">
	import { incidenceCells, type IncidenceCell } from '$lib/stores.svelte';
	import { getIncidenceCellTotalMonetaryValue, setIncidenceCell } from '$lib/utils';
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

	let unitMonetaryValue = $state(incidenceCell.incidence.unitMonetaryValue);
	let unit = $state(incidenceCell.incidence.unit);
	let unitValueIsDerived = $state(incidenceCell.incidence.unitValueIsDerived);

	async function acceptChanges() {
		const totalMonetaryValue = getIncidenceCellTotalMonetaryValue(
			incidenceCell.incidence.amount,
			unitMonetaryValue
		);
		setIncidenceCell(incidenceCells.value, categoryId, employeeId, {
			...incidenceCell,
			incidence: {...incidenceCell.incidence,
				unit,
				unitMonetaryValue,
				unitValueIsDerived,
				basedOnCategory: false
			},
			totalMonetaryValue
		});
		incidenceCells.value = new Map(incidenceCells.value); // Trigger reactivity
		await fetch('/api/incidence', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: incidenceCell.incidence.id,
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
