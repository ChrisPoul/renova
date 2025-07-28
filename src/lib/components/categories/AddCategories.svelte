<script lang="ts">
	import { addCategory } from '$lib/client/state';
	import { categories, selectedWeek } from '$lib/stores.svelte';
	import ModalMenu from '$lib/components/common/ModalMenu.svelte';

	let categoriesToAdd: Category[] = $state([]);
	let selectedCategories: number[] = $state([]);
	let isMenuOpen = $state(false);

	$effect(() => {
		if (isMenuOpen) {
			(async () => {
				const response = await fetch('/api/categories');
				const allCategories: Category[] = await response.json();
				categoriesToAdd = allCategories.filter((category) => !categories.value.has(category.id));
			})();
		}
	});

	async function acceptChanges() {
		const response = await fetch('/api/categories-to-week', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ categoryIds: selectedCategories, weekId: selectedWeek.value!.id })
		});
		const {
			categories,
			incidences
		}: {
			categories: Category[];
			incidences: Incidence[];
		} = await response.json();
		const incidencesByCategory = new Map<number, Incidence[]>();
		for (const incidence of incidences) {
			if (!incidencesByCategory.has(incidence.categoryId)) {
				incidencesByCategory.set(incidence.categoryId, []);
			}
			incidencesByCategory.get(incidence.categoryId)!.push(incidence);
		}
		for (const category of categories) {
			addCategory(category, incidencesByCategory.get(category.id)!);
		}
	}
</script>

<ModalMenu title="Select Categories" onAccept={acceptChanges} bind:isMenuOpen>
	{#snippet triggerButton()}
		<span class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
			Agregar Categorías
		</span>
	{/snippet}
	<div class="flex flex-col gap-2">
		{#each categoriesToAdd as category}
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:group={selectedCategories} value={category.id} />
				{category.concept}
			</label>
		{/each}
	</div>
</ModalMenu>
