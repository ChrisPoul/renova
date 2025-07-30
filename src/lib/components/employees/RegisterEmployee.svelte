<script lang="ts">
	import EmployeeForm from './EmployeeForm.svelte';
	import { addEmployee } from '$lib/client/state';
	import { selectedWeek } from '$lib/stores.svelte';

	const { context = '' } = $props();

	let name = $state('');
	let salary = $state(0);
	let puesto = $state('');
	let area = $state('');

	async function acceptChanges() {
		const body = {
			name,
			salary,
			puesto,
			area,
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

		const { employee, incidences } = await response.json();
		addEmployee(employee, incidences);
	}
</script>

<EmployeeForm bind:name bind:salary bind:puesto bind:area {acceptChanges}>
	{#snippet triggerButton()}
		<span class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-green-600">
			Registrar Empleado
		</span>
	{/snippet}
</EmployeeForm>
