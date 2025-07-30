<script lang="ts">
	import RegisterEmployee from '$lib/components/employees/RegisterEmployee.svelte';
	import RegisterCategory from '$lib/components/categories/RegisterCategory.svelte';
	import { enhance } from '$app/forms';

	export let data;
</script>

<svelte:head>
	<title>Manage</title>
	<meta name="description" content="Manage employees and categories" />
</svelte:head>

<section class="container mx-auto py-8">
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
		<div class="col-span-1">
			<div class="border p-4 rounded-lg">
				<h2 class="text-xl font-bold mb-4">Employees</h2>
				<RegisterEmployee />
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
									<form method="POST" action="?/deleteEmployee" use:enhance>
										<input type="hidden" name="id" value={employee.id} />
										<button type="submit" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
									</form>
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
				<RegisterCategory />
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
									<form method="POST" action="?/deleteCategory" use:enhance>
										<input type="hidden" name="id" value={category.id} />
										<button type="submit" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>