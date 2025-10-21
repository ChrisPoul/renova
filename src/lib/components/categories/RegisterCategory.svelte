<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import CategoryForm from './CategoryForm.svelte';
	import { selectedWeek } from '$lib/stores.svelte';
	import { invalidateAll } from '$app/navigation';

	const { context = '' } = $props();

	let category = $state({
		concept: '',
		type: categoryTypes[0],
		unit: 'kg',
		unitMonetaryValue: 1,
		unitValueIsDerived: false
	});

	async function acceptChanges() {
		const body = {
			...category,
			...(context !== 'manage' && { weekId: selectedWeek.value!.id })
		};
		await fetch('/api/category', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		await invalidateAll();
	}
</script>

<CategoryForm bind:category {acceptChanges}>
	{#snippet triggerButton()}
		<span class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
			Registrar Categoría
		</span>
	{/snippet}
</CategoryForm>
