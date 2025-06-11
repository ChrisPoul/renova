<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import { getCategoryTypeLabel } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import ModalMenu from './ModalMenu.svelte';
	import UnitInputs from './UnitInputs.svelte';

	let {
		concept = $bindable(),
		type = $bindable(),
		unit = $bindable(),
		unitMonetaryValue = $bindable(),
		unitValueIsDerived = $bindable(),
		deleteCategory,
		acceptChanges,
		triggerButton
	}: {
		concept: string;
		type: string;
		unit: string;
		unitMonetaryValue: number;
		unitValueIsDerived: boolean;
		deleteCategory?: () => void;
		acceptChanges: () => void;
		triggerButton: Snippet;
	} = $props();
</script>

<ModalMenu title="Editar Categoría" onAccept={acceptChanges} {triggerButton}>
	<div class="flex flex-col gap-2">
		<label>
			Concepto
			<input class="w-full rounded border px-2 py-1" bind:value={concept} />
		</label>
		<label>
			Tipo
			<select class="w-full rounded border px-2 py-1" bind:value={type}>
				{#each categoryTypes as categoryType}
					<option value={categoryType}>{getCategoryTypeLabel(categoryType)}</option>
				{/each}
			</select>
		</label>
		<UnitInputs bind:unit bind:unitMonetaryValue bind:unitValueIsDerived />
		{#if deleteCategory}
			<button onclick={deleteCategory} class="rounded-lg bg-red-400 px-4 py-2">Delete</button>
		{/if}
	</div>
</ModalMenu>
