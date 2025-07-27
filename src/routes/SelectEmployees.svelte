<script lang="ts">
	import { addEmployee } from '$lib/client/state';
	import { selectedWeek } from '$lib/stores.svelte';
	import { onMount } from 'svelte';
	import ModalMenu from './ModalMenu.svelte';

	let allEmployees: Employee[] = $state([]);
	let selectedEmployees: number[] = $state([]);

	onMount(async () => {
		const response = await fetch('/api/employees');
		allEmployees = await response.json();
	});

	async function acceptChanges() {
		const response = await fetch('/api/employees-to-week', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ employeeIds: selectedEmployees, weekId: selectedWeek.value!.id })
		});
		const {
			employees,
			incidencesByEmployee
		}: {
			employees: Employee[];
			incidencesByEmployee: Map<number, Incidence[]>;
		} = await response.json();
		for (const employee of employees) {
			addEmployee(employee, incidencesByEmployee.get(employee.id)!);
		}
	}
</script>

<ModalMenu title="Select Employees" onAccept={acceptChanges}>
	{#snippet triggerButton()}
		<span class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-green-600">
			Agregar Empleado
		</span>
	{/snippet}
	<div class="flex flex-col gap-2">
		{#each allEmployees as employee}
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:group={selectedEmployees} value={employee.id} />
				{employee.name}
			</label>
		{/each}
	</div>
</ModalMenu>
