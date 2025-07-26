<script lang="ts">
	import type { IncidenceCategory } from '$lib/server/db/schema';
	import { selectedWeek } from '$lib/stores.svelte';
	import CategoryForm from './CategoryForm.svelte';

	const {
		category
	}: {
		category: IncidenceCategory;
	} = $props();

	let concept = $state(category.concept);
	let type = $state(category.type);
	let unit = $state(category.unit);
	let unitMonetaryValue = $state(category.unitMonetaryValue);
	let unitValueIsDerived = $state(category.unitValueIsDerived);

	async function acceptChanges() {
		if (unitValueIsDerived) {
			unitMonetaryValue = 1;
		}
		await fetch('/api/category', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: category.id,
				changes: {
					concept,
					type,
					unit,
					unitMonetaryValue,
					unitValueIsDerived
				}
			})
		});
		location.reload();
	}
	async function deleteCategory() {
		if (!selectedWeek.value) return
		await fetch('/api/category', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: category.id, weekId: selectedWeek.value.id })
		});
		location.reload();
	}
</script>

<CategoryForm
	bind:concept
	bind:type
	bind:unit
	bind:unitMonetaryValue
	bind:unitValueIsDerived
	{acceptChanges}
	{deleteCategory}
>
	{#snippet triggerButton()}
		<img class="ml-1 w-4" src="/EditIcon.svg" alt="Editar" />
	{/snippet}
</CategoryForm>
