<script lang="ts">
	import EmployeeRow from './EmployeeRow.svelte';

	let categoriasDestajo = [
		{ id: 1, concept: 'Productivity Bonus', unit: '', unitValue: 12 },
		{ id: 2, concept: 'Corte Junke', unit: 'kg', unitValue: 20 }
	];

	let employees = $state([
		{
			name: 'John Doe',
			destajos: [
				{ id: 1, category: 1, amount: 100 },
				{ id: 2, category: 2, amount: 15 }
			]
		},
		{
			name: 'Jane Smith',
			destajos: [
				{ id: 3, category: 1, amount: 120 },
				{ id: 4, category: 2, amount: 20 }
			]
		}
	]);
</script>

<table class="w-auto table-auto border-collapse border border-gray-300">
	<thead>
		<tr class="bg-gray-100">
			<th class="border border-gray-300 px-4 py-2">Employee</th>
			{#each categoriasDestajo as category}
				<th class="border border-gray-300 px-4 py-2">
					{category.concept}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each employees as employee, i}
			<EmployeeRow bind:employee={employees[i]} {categoriasDestajo} />
		{/each}
	</tbody>
</table>
