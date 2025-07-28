<script lang="ts">
	import ModalMenu from '$lib/components/common/ModalMenu.svelte';
	import type { Snippet } from 'svelte';

	let {
		name = $bindable(),
		salary = $bindable(),
		puesto = $bindable(),
		area = $bindable(),
		deleteEmployee,
		acceptChanges,
		triggerButton
	}: {
		name: string;
		salary: number;
		puesto: string;
		area: string;
		deleteEmployee?: () => void;
		acceptChanges: () => void;
		triggerButton: Snippet;
	} = $props();
	let isMenuOpen = $state(false);
</script>

<ModalMenu title="Empleado" bind:isMenuOpen onAccept={acceptChanges} {triggerButton}>
	<div class="flex flex-col gap-2">
		<label>
			Nombre:
			<input type="text" bind:value={name} class="rounded border p-1" />
		</label>
		<label>
			Sueldo:
			<input type="number" bind:value={salary} class="rounded border p-1" />
		</label>
		<label>
			Puesto:
			<input type="text" bind:value={puesto} class="rounded border p-1" />
		</label>
		<label>
			Área:
			<input type="text" bind:value={area} class="rounded border p-1" />
		</label>
		{#if deleteEmployee}
			<button onclick={() => {
				deleteEmployee()
				isMenuOpen = false;
			}} class="rounded-lg bg-red-400 px-4 py-2">Eliminar</button>
		{/if}
	</div>
</ModalMenu>
