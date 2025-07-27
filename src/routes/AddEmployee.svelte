<script lang="ts">
	import EmployeeForm from './EmployeeForm.svelte';
	import { employees, incidenceCategories, incidenceCells, selectedWeek } from '$lib/stores.svelte';
	import { initiateIncidenceCell } from '$lib/utils';

	let name = $state('');
	let salary = $state(0);
	let puesto = $state('');
	let area = $state('');

	async function acceptChanges() {
		const response = await fetch('/api/employee', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, salary, puesto, area, weekId: selectedWeek.value!.id })
		});
		const { employee, incidences } = await response.json();
		employees.value.set(employee.id, employee);
		for (const incidence of incidences) {
			const category = incidenceCategories.value.get(incidence.categoryId);
			initiateIncidenceCell(incidenceCells.value, incidence, category!, employee);
		}
		employees.value = new Map(employees.value);
		incidenceCells.value = new Map(incidenceCells.value);
	}
</script>

<EmployeeForm bind:name bind:salary bind:puesto bind:area {acceptChanges}>
	{#snippet triggerButton()}
		<span class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-green-600">
			Agregar Empleado
		</span>
	{/snippet}
</EmployeeForm>
