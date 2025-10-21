<script lang="ts">
	import EmployeeForm from './EmployeeForm.svelte';
	import { addEmployee } from '$lib/client/state';
	import { selectedWeek } from '$lib/stores.svelte';
	import { EMPLOYEE_COLUMNS } from '$lib/constants';

	const { context = '' } = $props();

	let employee = $state(
		EMPLOYEE_COLUMNS.reduce((employeeObject, field) => {
			employeeObject[field.key as keyof Employee] = field.type === 'number' ? 0 : '' as any;
			return employeeObject;
		}, {} as Record<string, any>)
	);

	async function acceptChanges() {
		const body = {
			...employee,
			...(context !== 'manage' && { weekId: selectedWeek.value!.id })
		};
		const response = await fetch('/api/employee', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		if (context === 'manage') {
			location.reload();
			return;
		}

		const { employee: newEmployee, incidences } = await response.json();
		addEmployee(newEmployee, incidences);
	}
</script>

<EmployeeForm bind:employee {acceptChanges}>
	{#snippet triggerButton()}
		<span class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-green-600">
			Registrar Empleado
		</span>
	{/snippet}
</EmployeeForm>
