<script lang="ts">
	import ModalMenu from './ModalMenu.svelte';
	import UnitInputs from './UnitInputs.svelte';

	let {
		incidence = $bindable(),
		category,
		updateIncidence
	}: {
		incidence: Incidence;
		category: IncidenceCategory;
		updateIncidence: (incidence: Incidence, category: IncidenceCategory) => void;
	} = $props();

	let unitMonetaryValue = $state(
		incidence.basedOnCategory ? category.unitMonetaryValue : incidence.unitMonetaryValue
	);
	let unit = $state(incidence.basedOnCategory ? category.unit : incidence.unit);
	let unitValueIsDerived = $state(
		incidence.basedOnCategory ? category.unitValueIsDerived : incidence.unitValueIsDerived
	);

	function acceptChanges() {
		incidence.unit = unit;
		incidence.unitValueIsDerived = unitValueIsDerived;
		if (unitValueIsDerived) {
			unitMonetaryValue = 1;
		}
		incidence.unitMonetaryValue = unitMonetaryValue;
		incidence.basedOnCategory = false;

		updateIncidence(incidence, category);
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
