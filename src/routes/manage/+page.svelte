<script lang="ts">
	import RegisterEmployee from '$lib/components/employees/RegisterEmployee.svelte';
	import RegisterCategory from '$lib/components/categories/RegisterCategory.svelte';
	import EditEmployee from '$lib/components/employees/EditEmployee.svelte';
	import EditCategory from '$lib/components/categories/EditCategory.svelte';
	import { selectedWeek } from '$lib/stores.svelte.js';
	import { EMPLOYEE_COLUMNS, CATEGORY_FIELDS } from '$lib/constants';

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
	<div class="space-y-8">
		<div class="border p-4 rounded-lg">
			<h2 class="text-xl font-bold mb-4">Employees</h2>
			<RegisterEmployee />
			<div class="mt-4 overflow-x-auto">
				<table class="w-full min-w-max">
					<thead>
						<tr>
							{#each EMPLOYEE_COLUMNS as col}
								<th class="text-left px-2 py-1">{col.label}</th>
							{/each}
							<th class="text-left px-2 py-1">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.employees as employee}
							<tr>
								{#each EMPLOYEE_COLUMNS as col}
									<td class="px-2 py-1">
										{#if col.key === 'salary'}
											${(employee[col.key as keyof typeof employee] as number).toFixed(2)}
										{:else}
											{employee[col.key as keyof typeof employee]}
										{/if}
									</td>
								{/each}
								<td class="px-2 py-1">
									<EditEmployee employee={employee} context="manage" />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		<div class="border p-4 rounded-lg">
			<h2 class="text-xl font-bold mb-4">Categories</h2>
			<RegisterCategory context="manage" />
			<div class="mt-4 overflow-x-auto">
				<table class="w-full min-w-max">
					<thead>
						<tr>
							{#each CATEGORY_FIELDS as field}
								<th class="text-left px-2 py-1">{field.label}</th>
							{/each}
							<th class="text-left px-2 py-1">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.categories as category}
							<tr>
								{#each CATEGORY_FIELDS as field}
									<td class="px-2 py-1">
										{#if field.key === 'unitMonetaryValue'}
											{#if category.unitValueIsDerived}
												Derivado del Salario
											{:else}
												${(category[field.key as keyof typeof category] as number).toFixed(2)}
											{/if}
										{:else if field.key === 'unitValueIsDerived'}
											{category[field.key as keyof typeof category] ? 'Yes' : 'No'}
										{:else}
											{category[field.key as keyof typeof category]}
										{/if}
									</td>
								{/each}
								<td class="px-2 py-1">
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