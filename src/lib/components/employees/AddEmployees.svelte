<script lang="ts">
	import { employees, selectedWeek } from '$lib/stores.svelte';
	import ModalMenu from '$lib/components/common/ModalMenu.svelte';
	import { invalidateAll } from '$app/navigation';

	let employeesToAdd: Employee[] = $state([]);
	let selectedEmployees: number[] = $state([]);
	let isMenuOpen = $state(false);

	$effect(() => {
		if (isMenuOpen) {
			(async () => {
				const response = await fetch('/api/employee');
				const allEmployees: Employee[] = await response.json();
				employeesToAdd = allEmployees.filter((employee) => !employees.value.has(employee.id));
			})();
		}
	});

	async function acceptChanges() {
		await fetch('/api/employees-to-week', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ employeeIds: selectedEmployees, weekId: selectedWeek.value!.id })
		});
		
		await invalidateAll();
	}
</script>

<ModalMenu title="Select Employees" onAccept={acceptChanges} bind:isMenuOpen>
	{#snippet triggerButton()}
		<span class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-green-600">
			Agregar Empleados
		</span>
	{/snippet}
	<div class="flex flex-col gap-2">
		{#if employeesToAdd.length === 0}
			<p class="text-gray-500">No hay empleados disponibles para agregar.</p>
		{/if}
		{#each employeesToAdd as employee}
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:group={selectedEmployees} value={employee.id} />
				{employee.name}
			</label>
		{/each}
	</div>
</ModalMenu>