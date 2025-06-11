<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import CategoryForm from './CategoryForm.svelte';

	let concept = $state('');
	let type = $state(categoryTypes[0]);
	let unit = $state('kg');
	let unitMonetaryValue = $state(1);
	let unitValueIsDerived = $state(false);

	async function acceptChanges() {
		if (unitValueIsDerived) {
			unitMonetaryValue = 1;
		}
		await fetch('/api/category', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				concept,
				type,
				unit,
				unitMonetaryValue,
				unitValueIsDerived
			})
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
>
	{#snippet triggerButton()}
		<span class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
			Agregar Categoría
		</span>
	{/snippet}
</CategoryForm>
