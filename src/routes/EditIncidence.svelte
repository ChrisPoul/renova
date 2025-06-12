<script lang="ts">
	import ModalMenu from './ModalMenu.svelte';
	import UnitInputs from './UnitInputs.svelte';

	let {
		incidencia = $bindable(),
		category,
		updateIncidenceAmount
	}: {
		incidencia: Incidence;
		category: IncidenceCategory;
		updateIncidenceAmount: (incidencia: Incidence, category: IncidenceCategory) => void;
	} = $props();

	let unitMonetaryValue = $state(
		incidencia.basedOnCategory ? category.unitMonetaryValue : incidencia.unitMonetaryValue
	);
	let unit = $state(incidencia.basedOnCategory ? category.unit : incidencia.unit);
	let unitValueIsDerived = $state(
		incidencia.basedOnCategory ? category.unitValueIsDerived : incidencia.unitValueIsDerived
	);

	function acceptChanges() {
		incidencia.unit = unit;
		incidencia.unitValueIsDerived = unitValueIsDerived;
		if (unitValueIsDerived) {
			unitMonetaryValue = 1;
		}
		incidencia.unitMonetaryValue = unitMonetaryValue;
		incidencia.basedOnCategory = false;

		updateIncidenceAmount(incidencia, category);
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
