<script lang="ts">
	import RegisterEmployee from '$lib/components/employees/RegisterEmployee.svelte';
	import RegisterCategory from '$lib/components/categories/RegisterCategory.svelte';
	import EditEmployee from '$lib/components/employees/EditEmployee.svelte';
	import EditCategory from '$lib/components/categories/EditCategory.svelte';
	import { selectedWeek } from '$lib/stores.svelte.js';

	export let data;
</script>

<svelte:head>
	<title>Manage</title>
	<meta name="description" content="Manage employees and categories" />
</svelte:head>

<section class="relative container mx-auto py-12">
	<a
			href={selectedWeek.value ? `/?weekId=${selectedWeek.value.id}` : "/"}
			class="absolute top-0 left-0 rounded-lg bg-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-300"
		>
			← Regresar
		</a>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
		<div class="col-span-1">
			<div class="border p-4 rounded-lg">
				<h2 class="text-xl font-bold mb-4">Employees</h2>
				<RegisterEmployee context="manage" />
				<table class="w-full mt-4">
					<thead>
						<tr>
							<th class="text-left">Name</th>
							<th class="text-left">Salary</th>
							<th class="text-left">Puesto</th>
							<th class="text-left">Area</th>
							<th class="text-left">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.employees as employee}
							<tr>
								<td>{employee.name}</td>
								<td>{employee.salary}</td>
								<td>{employee.puesto}</td>
								<td>{employee.area}</td>
								<td>
									<EditEmployee employee={employee} context="manage" />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		<div class="col-span-1">
			<div class="border p-4 rounded-lg">
				<h2 class="text-xl font-bold mb-4">Categories</h2>
				<RegisterCategory context="manage" />
				<table class="w-full mt-4">
					<thead>
						<tr>
							<th class="text-left">Concept</th>
							<th class="text-left">Type</th>
							<th class="text-left">Unit</th>
							<th class="text-left">Unit Monetary Value</th>
							<th class="text-left">Derived</th>
							<th class="text-left">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.categories as category}
							<tr>
								<td>{category.concept}</td>
								<td>{category.type}</td>
								<td>{category.unit}</td>
								<td>{category.unitMonetaryValue}</td>
								<td>{category.unitValueIsDerived ? 'Yes' : 'No'}</td>
								<td>
									<EditCategory category={category} context="manage" />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>