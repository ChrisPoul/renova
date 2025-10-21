<script lang="ts">
	import EmployeeForm from './EmployeeForm.svelte';
	import { selectedWeek } from '$lib/stores.svelte';
	import { EMPLOYEE_COLUMNS } from '$lib/constants';
	import { invalidateAll } from '$app/navigation';

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
		await fetch('/api/employee', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		await invalidateAll();
	}
</script>

<EmployeeForm bind:employee {acceptChanges} {context}>
	{#snippet triggerButton()}
		<span class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-green-600">
			Registrar Empleado
		</span>
	{/snippet}
</EmployeeForm>
