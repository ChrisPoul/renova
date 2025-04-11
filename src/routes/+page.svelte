<script>
	// Example data for perception categories
	let perceptionCategories = [
		{ id: 1, concept: 'Productivity Bonus', unit: '$', canEdit: true },
		{ id: 2, concept: 'Corte Junke', unit: 'kg', canEdit: false }
	];

	// Example data for employees with perceptions
	let employees = [
		{
			name: 'John Doe',
			perceptions: [
				{ id: 1, category: 1, amount: 100 },
				{ id: 2, category: 2, amount: 15 }
			]
		},
		{
			name: 'Jane Smith',
			perceptions: [
				{ id: 3, category: 1, amount: 120 },
				{ id: 4, category: 2, amount: 20 }
			]
		}
	];
</script>

<table class="w-auto table-auto border-collapse border border-gray-300">
	<thead>
		<tr class="bg-gray-100">
			<th class="border border-gray-300 px-4 py-2 text-left">Employee</th>
			{#each perceptionCategories as category}
				<th class="border border-gray-300 px-4 py-2 text-left">
					{category.concept}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each employees as employee}
			<tr class="odd:bg-white even:bg-gray-50">
				<td class="border border-gray-300 px-4 py-2">{employee.name}</td>
				{#each perceptionCategories as category}
					<td class="border border-gray-300 px-4 py-2">
						{#each employee.perceptions as perception}
							{#if perception.category === category.id}
								{#if category.canEdit}
									<input
										type="number"
										bind:value={perception.amount}
										class="rounded-md border w-auto border-gray-300 px-2 py-1"
									/>
                  {category.unit}
								{:else}
									<span>{perception.amount}{category.unit}</span>
								{/if}
							{/if}
						{/each}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
