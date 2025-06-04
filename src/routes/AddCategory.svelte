<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import CategoryForm from './CategoryForm.svelte';

	let concept = $state('');
	let type = $state(categoryTypes[0]);
	let unit = $state('kg');
	let unitMonetaryValue = $state(1);

	async function acceptChanges() {
		await fetch('/api/category', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				concept,
				type,
				unit,
				unitMonetaryValue
			})
		});
		location.reload();
	}
</script>

<CategoryForm bind:concept bind:type bind:unit bind:unitMonetaryValue {acceptChanges}>
	{#snippet triggerButton()}
		<span class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
			Agregar Categoría
		</span>
	{/snippet}
</CategoryForm>
