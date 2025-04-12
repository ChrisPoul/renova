<script lang="ts">
	let {
		employee = $bindable(),
		categoriasDestajo
	}: { employee: Employee; categoriasDestajo: CategoriaDestajo[] } = $props();

	function getDestajoTotal(amount: number, unitValue: number) {
		return amount * unitValue;
	}
	function formatNumber(value: number) {
		return value.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}
</script>

<tr class="odd:bg-white even:bg-gray-50">
	<td class="border border-gray-300 px-4 py-2">{employee.name}</td>
	{#each categoriasDestajo as category}
		<td class="border border-gray-300 px-4 py-2">
			{#each employee.destajos as destajo}
				{#if destajo.category === category.id}
					<input
						type="number"
            step="0.01"
						bind:value={destajo.amount}
						class="w-20 rounded-md border border-gray-300 px-2 py-1"
						oninput={() => {
							if (!isNaN(destajo.amount)) {
                let numberStr = destajo.amount.toString()
                let decimalsStr: string | undefined = numberStr.split('.')[1]
                if (decimalsStr?.length > 2) {
                  destajo.amount = parseFloat(numberStr.slice(0, -1));
                }
							}
						}}
					/>
					{category.unit}
					{#if category.unitValue}
						<span class="text-gray-500">
							{formatNumber(getDestajoTotal(destajo.amount, category.unitValue))}$
						</span>
					{/if}
				{/if}
			{/each}
		</td>
	{/each}
</tr>
