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
	<div class="flex flex-col w-lg gap-2">
		<label class="flex flex-col">
			<span>Nombre:</span>
			<input type="text" bind:value={name} class="rounded border p-1 w-full" />
		</label>
		<label class="flex flex-col">
			<span>Sueldo:</span>
			<input type="number" bind:value={salary} class="rounded border p-1 w-full" />
		</label>
		<label class="flex flex-col">
			<span>Puesto:</span>
			<input type="text" bind:value={puesto} class="rounded border p-1 w-full" />
		</label>
		<label class="flex flex-col">
			<span>Área:</span>
			<input type="text" bind:value={area} class="rounded border p-1 w-full" />
		</label>
		{#if deleteEmployee}
			<button onclick={() => {
				deleteEmployee()
				isMenuOpen = false;
			}} class="rounded-lg bg-red-400 px-4 py-2">Eliminar</button>
		{/if}
	</div>
</ModalMenu>