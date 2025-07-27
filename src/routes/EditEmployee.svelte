<script lang="ts">
	import * as clientState from '$lib/client/state';
	import { selectedWeek } from '$lib/stores.svelte';
	import EmployeeForm from './EmployeeForm.svelte';

	let {
		employee
	}: {
		employee: Employee;
	} = $props();

	let name = $state(employee.name);
	let salary = $state(employee.salary);
	let puesto = $state(employee.puesto);
	let area = $state(employee.area);

	async function acceptChanges() {
		const changes = { name, salary, puesto, area };
		await fetch('/api/employee', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: employee.id,
				changes: changes
			})
		});
		clientState.updateEmployee({ ...employee, ...changes });
	}

	async function deleteEmployee() {
		await fetch('/api/employee', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: employee.id, weekId: selectedWeek.value!.id })
		});
		clientState.deleteEmployee(employee.id);
	}
</script>

<EmployeeForm bind:name bind:salary bind:puesto bind:area {acceptChanges} {deleteEmployee}>
	{#snippet triggerButton()}
		<img class="ml-1 w-4" src="/EditIcon.svg" alt="Editar" />
	{/snippet}
</EmployeeForm>
