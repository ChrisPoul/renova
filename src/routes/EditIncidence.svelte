<script lang="ts">
	import { incidenceCells, type IncidenceCell } from '$lib/stores.svelte';
	import {
		getIncidenceCellTotalMonetaryValue,
		getIncidenceUnitMonetaryValue,
		setIncidenceCell
	} from '$lib/utils';
	import ModalMenu from './ModalMenu.svelte';
	import UnitInputs from './UnitInputs.svelte';

	const {
		category,
		employee,
		incidenceCell
	}: {
		category: Category;
		employee: Employee;
		incidenceCell: IncidenceCell;
	} = $props();

	let unitMonetaryValue = $state(incidenceCell.incidence.unitMonetaryValue);
	let unit = $state(incidenceCell.incidence.unit);
	let unitValueIsDerived = $state(incidenceCell.incidence.unitValueIsDerived);

	async function acceptChanges() {
		const changes = {
			unit,
			unitMonetaryValue,
			unitValueIsDerived,
			basedOnCategory: false
		};
		incidenceCell.incidence = { ...incidenceCell.incidence, ...changes };
		unitMonetaryValue = getIncidenceUnitMonetaryValue(incidenceCell.incidence, category, employee);
		const totalMonetaryValue = getIncidenceCellTotalMonetaryValue(
			incidenceCell.incidence.amount,
			unitMonetaryValue
		);
		incidenceCell.incidence.unitMonetaryValue = unitMonetaryValue;
		incidenceCell.totalMonetaryValue = totalMonetaryValue;
		changes.unitMonetaryValue = unitMonetaryValue;
		setIncidenceCell(incidenceCells.value, category.id, employee.id, { ...incidenceCell });
		incidenceCells.value = new Map(incidenceCells.value); // Trigger reactivity
		await fetch('/api/incidence', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: incidenceCell.incidence.id,
				changes: changes
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
