<script lang="ts">
	import { addEmployee } from '$lib/client/state';
	import { employees, selectedWeek } from '$lib/stores.svelte';
	import { onMount } from 'svelte';
	import ModalMenu from './ModalMenu.svelte';

	let employeesToAdd: Employee[] = $state([]);
	let selectedEmployees: number[] = $state([]);

	onMount(async () => {
		const response = await fetch('/api/employees');
		const allEmployees: Employee[] = await response.json();
		employeesToAdd = allEmployees.filter((employee) => !employees.value.has(employee.id));
	});

	async function acceptChanges() {
		const response = await fetch('/api/employees-to-week', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ employeeIds: selectedEmployees, weekId: selectedWeek.value!.id })
		});
		const {
			newEmployees,
			newIncidences
		}: {
			newEmployees: Employee[];
			newIncidences: Incidence[];
		} = await response.json();
		const incidencesByEmployee = new Map<number, Incidence[]>();
		for (const incidence of newIncidences) {
			if (!incidencesByEmployee.has(incidence.employeeId)) {
				incidencesByEmployee.set(incidence.employeeId, []);
			}
			incidencesByEmployee.get(incidence.employeeId)!.push(incidence);
		}
		for (const employee of newEmployees) {
			addEmployee(employee, incidencesByEmployee.get(employee.id)!);
		}
	}
</script>

<ModalMenu title="Select Employees" onAccept={acceptChanges}>
	{#snippet triggerButton()}
		<span class="rounded bg-indigo-400 px-4 py-2 text-white hover:bg-green-600">
			Agregar Empleados
		</span>
	{/snippet}
	<div class="flex flex-col gap-2">
		{#each employeesToAdd as employee}
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:group={selectedEmployees} value={employee.id} />
				{employee.name}
			</label>
		{/each}
	</div>
</ModalMenu>