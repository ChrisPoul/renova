<script lang="ts">
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

	async function acceptChanges() {
		await fetch('/api/category', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: category.id,
				changes: {
					concept,
					type,
					unit,
					unitMonetaryValue
				}
			})
		});
		location.reload();
	}
	async function deleteCategory() {
		await fetch('/api/category', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: category.id })
		});
		location.reload();
	}
</script>

<CategoryForm
  bind:concept
  bind:type
  bind:unit
  bind:unitMonetaryValue
  {acceptChanges}
  {deleteCategory}
>
  {#snippet triggerButton()}
    <img class="ml-1 w-4" src="/EditIcon.svg" alt="Editar" />
  {/snippet}
</CategoryForm>
