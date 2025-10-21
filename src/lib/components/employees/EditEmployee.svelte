<script lang="ts">
	import * as clientState from '$lib/client/state';
	import { selectedWeek } from '$lib/stores.svelte';
	import EmployeeForm from './EmployeeForm.svelte';
	import { EMPLOYEE_COLUMNS } from '$lib/constants';

	let {
		employee,
		context = ''
	}: {
		employee: Partial<Employee> & { id: number };
		context?: string;
	} = $props();

	let editedEmployee = $state({ ...employee });

	async function acceptChanges() {
		const changes = EMPLOYEE_COLUMNS.reduce((changesObject, field) => {
			changesObject[field.key] = editedEmployee[field.key as keyof Employee];
			return changesObject;
		}, {} as Record<string, any>);
		if (context === 'manage') {
			await fetch('/api/employee', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: employee.id,
					changes: changes
				})
			});
			location.reload();
			return;
		}
		await fetch('/api/employees-to-week', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				employeeId: employee.id,
				weekId: selectedWeek.value!.id,
				changes: changes
			})
		});
		clientState.updateEmployee({ ...employee, ...editedEmployee });
	}

	async function deleteEmployee() {
		if (context === 'manage') {
			await fetch('/api/employee', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ employeeId: employee.id })
			});
			location.reload();
			return;
		}
		await fetch('/api/employees-to-week', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ employeeId: employee.id, weekId: selectedWeek.value!.id })
		});
		clientState.deleteEmployee(employee.id);
	}
</script>

<EmployeeForm bind:employee={editedEmployee} {acceptChanges} {deleteEmployee}>
	{#snippet triggerButton()}
		<img class="w-4" src="/EditIcon.svg" alt="Editar" />
	{/snippet}
</EmployeeForm>
