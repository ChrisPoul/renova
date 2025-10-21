<script lang="ts">
	import { selectedWeek } from '$lib/stores.svelte';
	import CategoryForm from './CategoryForm.svelte';
	import { invalidateAll } from '$app/navigation';
	import { CATEGORY_FIELDS } from '$lib/constants';

	let {
		category,
		context = ''
	}: {
		category: Category;
		context?: string;
	} = $props();

	let editedCategory = $state({ ...category });

	async function acceptChanges() {
		const changes = CATEGORY_FIELDS.reduce((changesObject, field) => {
			changesObject[field.key] = editedCategory[field.key as keyof Category];
			return changesObject;
		}, {} as Record<string, any>);
		
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

<CategoryForm bind:category={editedCategory} {acceptChanges} {deleteCategory}>
	{#snippet triggerButton()}
		<img class="ml-1 w-4" src="/EditIcon.svg" alt="Editar" />
	{/snippet}
</CategoryForm>
