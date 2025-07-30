<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import CategoryForm from './CategoryForm.svelte';
	import { addCategory } from '$lib/client/state';
	import { selectedWeek } from '$lib/stores.svelte';

	const { context = '' } = $props();

	let concept = $state('');
	let type = $state(categoryTypes[0]);
	let unit = $state('kg');
	let unitMonetaryValue = $state(1);
	let unitValueIsDerived = $state(false);

	async function acceptChanges() {
		const body = {
			concept,
			type,
			unit,
			unitMonetaryValue,
			unitValueIsDerived,
			...(context !== 'manage' && { weekId: selectedWeek.value!.id })
		};
		const response = await fetch('/api/category', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		if (context === 'manage') {
			location.reload();
			return;
		}

		const { category, incidences } = await response.json();
		addCategory(category, incidences);
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
			Registrar Categoría
		</span>
	{/snippet}
</CategoryForm>
