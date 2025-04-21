<script lang="ts">
	import { onMount } from 'svelte';
	import { totals } from '$lib/stores/totals.svelte';
	import { formatMonetaryValue } from '$lib/utils';

	let {
		employee,
		categoriasDestajo
	}: { employee: Employee; categoriasDestajo: CategoriaDestajo[] } = $props();

	let employeeTotalMonetaryValue = $state(0);

	let categoriasDestajoMap = new Map<number, CategoriaDestajo>(
		categoriasDestajo.map((category) => [category.id, category])
	);
	let destajosMapByCategory = new Map<number, Destajo>(
		employee.destajos.map((destajo) => [destajo.category, destajo])
	);

	onMount(() => {
		updateEmployeeTotalMonetaryValue();
		updateCategoryTotalMonetaryValues();
	});

	function getDestajoTotalMonetaryValue(amount: number, unitMonetaryValue: number) {
		return amount * unitMonetaryValue;
	}
	function validateDestajoAmount(amount: number) {
		if (!amount) return 0;
		if (isNaN(amount)) return 0;
		if (amount < 0) return 0;

		const numberStr = amount.toString();
		const decimalsStr: string | undefined = numberStr.split('.')[1];
		const numberHasMoreThanTwoDecimals = decimalsStr && decimalsStr.length > 2;
		if (numberHasMoreThanTwoDecimals) {
			return parseFloat(numberStr.slice(0, -1));
		}
		return amount;
	}
	function updateDestajoAmount(destajo: Destajo) {
		destajo.amount = validateDestajoAmount(destajo.amount);
		updateEmployeeTotalMonetaryValue();
		updateCategoryTotalMonetaryValueByDestajo(destajo);
	}
	function updateEmployeeTotalMonetaryValue() {
		employeeTotalMonetaryValue = getEmployeeTotalMonetaryValue(employee);
		totals.byEmployee.set(employee.id, employeeTotalMonetaryValue);
		totals.byEmployee = new Map(totals.byEmployee);
	}
	function getEmployeeTotalMonetaryValue(employee: Employee) {
		let total = 0;
		for (const destajo of employee.destajos) {
			const category = categoriasDestajoMap.get(destajo.category);
			if (category) {
				total += getDestajoTotalMonetaryValue(destajo.amount, category.unitMonetaryValue);
			}
		}
		return total;
	}
	function updateCategoryTotalMonetaryValues() {
		for (const destajo of employee.destajos) {
			updateCategoryTotalMonetaryValueByDestajo(destajo);
		}
	}
	function updateCategoryTotalMonetaryValueByDestajo(destajo: Destajo) {
		const category = categoriasDestajoMap.get(destajo.category);
		if (!category) return;
		let destajoTotalMonetaryValue = getDestajoTotalMonetaryValue(
			destajo.amount,
			category.unitMonetaryValue
		);
		const categoryDestajos = totals.byCategory.get(category.id);
		if (categoryDestajos) {
			categoryDestajos.set(destajo.id, destajoTotalMonetaryValue);
		} else {
			totals.byCategory.set(destajo.category, new Map([[destajo.id, destajoTotalMonetaryValue]]));
		}
		totals.byCategory = new Map(totals.byCategory);
	}
</script>

<tr class="odd:bg-white even:bg-gray-50">
	<td class="border border-gray-300 px-4 py-2">{employee.name}</td>
	{#each categoriasDestajo as category}
		{@const destajo = destajosMapByCategory.get(category.id)}
		<td class="border border-gray-300 px-4 py-2">
			{#if destajo}
				<input
					type="number"
					step="0.01"
					bind:value={destajo.amount}
					class="w-20 rounded-md border border-gray-300 px-2 py-1"
					oninput={() => updateDestajoAmount(destajo)}
				/>
				{category.unit}
				<span class="text-gray-500">
					{formatMonetaryValue(
						getDestajoTotalMonetaryValue(destajo.amount, category.unitMonetaryValue)
					)}
				</span>
			{/if}
		</td>
	{/each}
	<td class="border border-gray-300 px-4 py-2">
		<span class="text-gray-500">
			{formatMonetaryValue(employeeTotalMonetaryValue)}
		</span>
	</td>
</tr>
