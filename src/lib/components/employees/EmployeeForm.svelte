<script lang="ts">
	import ModalMenu from '$lib/components/common/ModalMenu.svelte';
	import type { Snippet } from 'svelte';
	import { EMPLOYEE_COLUMNS } from '$lib/constants';

	let {
		employee = $bindable(),
		deleteEmployee,
		acceptChanges,
		triggerButton
	}: {
		employee: Partial<Employee>;
		deleteEmployee?: () => void;
		acceptChanges: () => void;
		triggerButton: Snippet;
	} = $props();
	let isMenuOpen = $state(false);
</script>

<ModalMenu title="Empleado" bind:isMenuOpen onAccept={acceptChanges} {triggerButton}>
	<div class="flex flex-col w-lg gap-2">
		{#each EMPLOYEE_COLUMNS as field}
			<label class="flex flex-col">
				<span>{field.key === 'name' ? 'Nombre' : field.label}:</span>
				<input 
					type={field.type} 
					bind:value={employee[field.key as keyof Employee]} 
					class="rounded border p-1 w-full" 
				/>
			</label>
		{/each}
		{#if deleteEmployee}
			<button onclick={() => {
				deleteEmployee()
				isMenuOpen = false;
			}} class="rounded-lg bg-red-400 px-4 py-2">Eliminar</button>
		{/if}
	</div>
</ModalMenu>