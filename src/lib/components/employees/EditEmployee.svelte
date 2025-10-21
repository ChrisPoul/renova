<script lang="ts">
	import { selectedWeek } from '$lib/stores.svelte';
	import EmployeeForm from './EmployeeForm.svelte';
	import { EMPLOYEE_COLUMNS } from '$lib/constants';
	import { invalidateAll } from '$app/navigation';

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
			await invalidateAll();
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
		await invalidateAll();
	}

	async function deleteEmployee() {
		if (context === 'manage') {
			await fetch('/api/employee', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ employeeId: employee.id })
			});
			await invalidateAll();
			return;
		}
		
		await fetch('/api/employees-to-week', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ employeeId: employee.id, weekId: selectedWeek.value!.id })
		});
		await invalidateAll();
	}
</script>

<EmployeeForm bind:employee={editedEmployee} {acceptChanges} {deleteEmployee} {context}>
	{#snippet triggerButton()}
		<img class="w-4" src="/EditIcon.svg" alt="Editar" />
	{/snippet}
</EmployeeForm>
