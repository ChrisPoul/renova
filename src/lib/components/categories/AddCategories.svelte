<script lang="ts">
	import { categories, selectedWeek } from '$lib/stores.svelte';
	import ModalMenu from '$lib/components/common/ModalMenu.svelte';
	import { invalidateAll } from '$app/navigation';

	let categoriesToAdd: Category[] = $state([]);
	let selectedCategories: number[] = $state([]);
	let isMenuOpen = $state(false);

	$effect(() => {
		if (isMenuOpen) {
			(async () => {
				const response = await fetch('/api/category');
				const allCategories: Category[] = await response.json();
				categoriesToAdd = allCategories.filter((category) => !categories.value.has(category.id));
			})();
		}
	});

	async function acceptChanges() {
		await fetch('/api/categories-to-week', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ categoryIds: selectedCategories, weekId: selectedWeek.value!.id })
		});
		
		await invalidateAll();
	}
</script>

<ModalMenu title="Select Categories" onAccept={acceptChanges} bind:isMenuOpen>
	{#snippet triggerButton()}
		<span class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
			Agregar Categorías
		</span>
	{/snippet}
	<div class="flex flex-col gap-2">
		{#if categoriesToAdd.length === 0}
			<p class="text-gray-500">No hay categorías disponibles para agregar.</p>
		{/if}
		{#each categoriesToAdd as category}
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:group={selectedCategories} value={category.id} />
				{category.concept}
			</label>
		{/each}
	</div>
</ModalMenu>
