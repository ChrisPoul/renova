<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import { getCategoryTypeLabel } from '$lib/utils';
	import UnitInputs from './UnitInputs.svelte';

	let concept = $state('');
	let type = $state('percepcion');
	let categoryType = $state(categoryTypes[0]);
	let unit = $state('kg');
	let unitMonetaryValue = $state(1);
	
</script>

<form class="m-10 rounded border border-gray-300 p-4">
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium" for="concept">Concepto</label>
		<input
			id="concept"
			type="text"
			bind:value={concept}
			class="w-full rounded border border-gray-300 px-2 py-1"
			required
		/>
	</div>
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium" for="type">Tipo</label>
		<select id="type" bind:value={type} class="w-full rounded border border-gray-300 px-2 py-1">
			<option value="percepcion">Percepción</option>
			<option value="deduccion">Deducción</option>
		</select>
	</div>
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium" for="categoryType">Categoría</label>
		<select
			id="categoryType"
			bind:value={categoryType}
			class="w-full rounded border border-gray-300 px-2 py-1"
		>
			{#each categoryTypes as category}
				<option value={category}>{getCategoryTypeLabel(category)}</option>
			{/each}
		</select>
	</div>
	<UnitInputs bind:unit bind:unitMonetaryValue />
	<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
		Agregar Categoría
	</button>
</form>
