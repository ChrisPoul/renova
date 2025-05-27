<script lang="ts">
	import ModalMenu from './ModalMenu.svelte';
	import UnitInputs from './UnitInputs.svelte';

	let {
		incidencia=$bindable(),
		category,
		updateIncidenciaAmount
	}: {
		incidencia: Incidencia;
		category: CategoriaIncidencia;
		updateIncidenciaAmount: (incidencia: Incidencia, category: CategoriaIncidencia) => void;
	} = $props();

	let isMenuOpen = $state(false);
	let unitMonetaryValue = $state(incidencia.unitMonetaryValue || category.unitMonetaryValue);
	let unit = $state(incidencia.unit || category.unit);

	function acceptChanges() {
    incidencia.unitMonetaryValue = unitMonetaryValue;
    incidencia.unit = unit;
		updateIncidenciaAmount(incidencia, category);
		isMenuOpen = false;
	}
</script>

<button
	class="ml-0.5 w-4"
	tabindex="-1"
	onclick={() => {
		isMenuOpen = true;
	}}
>
	<img class="bg-white" src="/EditIcon.svg" alt="" />
</button>
{#if isMenuOpen}
	<ModalMenu title="Editar Unidad" onAccept={acceptChanges} onCancel={() => (isMenuOpen = false)}>
		<div class="flex flex-col gap-2">
			<UnitInputs bind:unit bind:unitMonetaryValue />
		</div>
	</ModalMenu>
{/if}
