<script lang="ts">
	import type { IncidenceCategory } from '$lib/server/db/schema';
	import { employees, incidenceCategories, incidenceCells, selectedWeek } from '$lib/stores.svelte';
	import { initiateIncidenceCell } from '$lib/utils';
	import CategoryForm from './CategoryForm.svelte';

	let {
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
		const changes = {
			concept,
			type,
			unit,
			unitMonetaryValue,
			unitValueIsDerived
		};
		await fetch('/api/category', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: category.id,
				changes
			})
		});
		category = { ...category, ...changes };
		incidenceCategories.value.set(category.id, category);
		const categoryIncidenceCells = incidenceCells.value.get(category.id);
		if (!categoryIncidenceCells) return;
		for (const [employeeId, incidenceCell] of categoryIncidenceCells) {
			const employee = employees.value.get(employeeId);
			if (!employee) continue;
			initiateIncidenceCell(incidenceCells.value, incidenceCell.incidence, category, employee);
		}
		incidenceCategories.value = new Map(incidenceCategories.value);
		incidenceCells.value = new Map(incidenceCells.value);
	}
	async function deleteCategory() {
		if (!selectedWeek.value) return;
		await fetch('/api/category', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: category.id, weekId: selectedWeek.value.id })
		});
		incidenceCategories.value.delete(category.id);
		incidenceCategories.value = new Map(incidenceCategories.value)
		incidenceCells.value.delete(category.id);
		incidenceCells.value = new Map(incidenceCells.value);
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
