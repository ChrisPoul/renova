<script lang="ts">
	import EmployeeForm from './EmployeeForm.svelte';
	import { selectedWeekId } from '$lib/stores.svelte';

	let name = $state('');
	let salary = $state(0);
	let puesto = $state('');
	let area = $state('');

	async function acceptChanges() {
		await fetch('/api/employee', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, salary, puesto, area, weekId: selectedWeekId.value })
		});
		location.reload();
	}
</script>

<EmployeeForm bind:name bind:salary bind:puesto bind:area {acceptChanges}>
	{#snippet triggerButton()}
		<span class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-green-600">
			Agregar Empleado
		</span>
	{/snippet}
</EmployeeForm>

