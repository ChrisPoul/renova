<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import { getCategoryTypeLabel } from '$lib/utils';
	import UnitInputs from './UnitInputs.svelte';

	let concept = $state('');
	let type = $state(categoryTypes[0]);
	let unit = $state('kg');
	let unitMonetaryValue = $state(1);
</script>

<form
	method="POST"
	action="?/addCategory"
	class="m-10 rounded border border-gray-300 p-4"
>
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium" for="concept">Concepto</label>
		<input
			name="concept"
			type="text"
			bind:value={concept}
			class="w-full rounded border border-gray-300 px-2 py-1"
			required
		/>
	</div>
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium" for="type">Tipo</label>
		<select name="type" bind:value={type} class="w-full rounded border border-gray-300 px-2 py-1">
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
