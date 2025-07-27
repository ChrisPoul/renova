<script lang="ts">
	import type { Employee } from '$lib/server/db/schema';
	import { employees, incidenceCategories, incidenceCells, selectedWeek } from '$lib/stores.svelte';
	import { initiateIncidenceCell } from '$lib/utils';
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
		employee = { ...employee, ...changes };
		employees.value.set(employee.id, employee);
		for (const [categoryId, categoryIncidenceCells] of incidenceCells.value) {
			const category = incidenceCategories.value.get(categoryId);
			const incidenceCell = categoryIncidenceCells.get(employee.id);
			initiateIncidenceCell(incidenceCells.value, incidenceCell!.incidence, category!, employee);
		}
		employees.value = new Map(employees.value);
		incidenceCells.value = new Map(incidenceCells.value);
	}

	async function deleteEmployee() {
		await fetch('/api/employee', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: employee.id, weekId: selectedWeek.value!.id })
		});
		employees.value.delete(employee.id);
		for (const categoryIncidenceCells of incidenceCells.value.values()) {
			categoryIncidenceCells.delete(employee.id);
		}
		employees.value = new Map(employees.value);
		incidenceCells.value = new Map(incidenceCells.value);
	}
</script>

<EmployeeForm bind:name bind:salary bind:puesto bind:area {acceptChanges} {deleteEmployee}>
	{#snippet triggerButton()}
		<img class="ml-1 w-4" src="/EditIcon.svg" alt="Editar" />
	{/snippet}
</EmployeeForm>
