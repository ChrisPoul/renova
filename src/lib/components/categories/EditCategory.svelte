<script lang="ts">
	import { selectedWeek } from '$lib/stores.svelte';
	import CategoryForm from './CategoryForm.svelte';
	import { invalidateAll } from '$app/navigation';

	let {
		category,
		context = ''
	}: {
		category: Category;
		context?: string;
	} = $props();

	let concept = $state(category.concept);
	let type = $state(category.type);
	let unit = $state(category.unit);
	let unitMonetaryValue = $state(category.unitMonetaryValue);
	let unitValueIsDerived = $state(category.unitValueIsDerived);

	async function acceptChanges() {
		const changes = {
			concept,
			type,
			unit,
			unitMonetaryValue,
			unitValueIsDerived
		};
		
		if (context === 'manage') {
			await fetch('/api/category', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: category.id,
					changes
				})
			});
			await invalidateAll();
			return;
		}
		
		await fetch('/api/categories-to-week', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				categoryId: category.id,
				weekId: selectedWeek.value!.id,
				changes
			})
		});
		await invalidateAll();
	}
	
	async function deleteCategory() {
		if (context === 'manage') {
			await fetch('/api/category', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ categoryId: category.id })
			});
			await invalidateAll();
			return;
		}
		
		await fetch('/api/categories-to-week', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ categoryId: category.id, weekId: selectedWeek.value!.id })
		});
		await invalidateAll();
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
