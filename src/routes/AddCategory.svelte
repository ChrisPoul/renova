<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import CategoryForm from './CategoryForm.svelte';
	import { employees, incidenceCategories, incidenceCells, selectedWeek } from '$lib/stores.svelte';
	import { initiateIncidenceCell } from '$lib/utils';

	let concept = $state('');
	let type = $state(categoryTypes[0]);
	let unit = $state('kg');
	let unitMonetaryValue = $state(1);
	let unitValueIsDerived = $state(false);

	async function acceptChanges() {
		const response = await fetch('/api/category', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				concept,
				type,
				unit,
				unitMonetaryValue,
				unitValueIsDerived,
				weekId: selectedWeek.value!.id
			})
		});
		let {category, incidences} = await response.json()
		incidenceCategories.value.set(category.id, category)
		for (const incidence of incidences) {
			const employee = employees.value.get(incidence.employeeId)
			initiateIncidenceCell(incidenceCells.value, incidence, category, employee!)
		}
		incidenceCategories.value = new Map(incidenceCategories.value)
		incidenceCells.value = new Map(incidenceCells.value)
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
