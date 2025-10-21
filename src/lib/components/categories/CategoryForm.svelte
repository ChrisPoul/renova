<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import { getCategoryTypeLabel } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import ModalMenu from '$lib/components/common/ModalMenu.svelte';
	import UnitInputs from '$lib/components/common/UnitInputs.svelte';

	let {
		category = $bindable(),
		deleteCategory,
		acceptChanges,
		triggerButton
	}: {
		category: Partial<Category> & { id?: number };
		deleteCategory?: () => void;
		acceptChanges: () => void;
		triggerButton: Snippet;
	} = $props();
	let isMenuOpen = $state(false);
</script>

<ModalMenu title="Editar Categoría" bind:isMenuOpen onAccept={acceptChanges} {triggerButton}>
	<div class="flex flex-col w-sm gap-2">
		<label class="flex flex-col">
			<span>Concepto</span>
			<input class="w-full rounded border px-2 py-1" bind:value={category.concept} />
		</label>
		<label class="flex flex-col">
			<span>Tipo</span>
			<select class="w-full rounded border px-2 py-1" bind:value={category.type}>
				{#each categoryTypes as categoryType}
					<option value={categoryType}>{getCategoryTypeLabel(categoryType)}</option>
				{/each}
			</select>
		</label>
		<UnitInputs 
			bind:unit={category.unit} 
			bind:unitMonetaryValue={category.unitMonetaryValue} 
			bind:unitValueIsDerived={category.unitValueIsDerived} 
		/>
		{#if deleteCategory}
			<button onclick={() => {
				deleteCategory()
				isMenuOpen = false;
			}} class="rounded-lg bg-red-400 px-4 py-2">Delete</button>
		{/if}
	</div>
</ModalMenu>