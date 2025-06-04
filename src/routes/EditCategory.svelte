<script lang="ts">
	import ModalMenu from './ModalMenu.svelte';
	import UnitInputs from './UnitInputs.svelte';

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

<ModalMenu title="Editar Categoría" onAccept={acceptChanges} onCancel={() => {}}>
	<div class="flex flex-col gap-2">
		<label>
			Concepto
			<input class="w-full rounded border px-2 py-1" bind:value={concept} />
		</label>
		<label>
			Tipo
			<select class="w-full rounded border px-2 py-1" bind:value={type}>
				<option value="destajo">Destajo</option>
				<option value="bono">Bono</option>
				<option value="deduccion">Deducción</option>
			</select>
		</label>
		<UnitInputs bind:unit bind:unitMonetaryValue />
		<button onclick={deleteCategory} class="bg-red-400">Delete</button>
	</div>
	{#snippet openButton()}
		<img class="ml-1 w-4" src="/EditIcon.svg" alt="Editar" />
	{/snippet}
</ModalMenu>
