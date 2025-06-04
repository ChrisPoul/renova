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

	let isMenuOpen = $state(false);
	let unitMonetaryValue = $state(incidencia.unitMonetaryValue || category.unitMonetaryValue);
	let unit = $state(incidencia.unit || category.unit);

	function acceptChanges() {
		incidencia.unitMonetaryValue = unitMonetaryValue;
		incidencia.unit = unit;
		updateIncidenceAmount(incidencia, category);
	}
</script>

<ModalMenu title="Editar Unidad" onAccept={acceptChanges} onCancel={() => (isMenuOpen = false)}>
	<div class="flex flex-col gap-2">
		<UnitInputs bind:unit bind:unitMonetaryValue />
	</div>
	{#snippet openButton()}
		<img class="ml-0.5 w-4 bg-white" src="/EditIcon.svg" alt="" />
	{/snippet}
</ModalMenu>
