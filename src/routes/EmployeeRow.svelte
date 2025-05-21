<script lang="ts">
	import { onMount } from 'svelte';
	import { selectedCategoryTypes, totals } from '$lib/stores.svelte';
	import { formatMonetaryValue, validateAmount } from '$lib/utils';
	import { categoryTypes } from '$lib/constants';
	import UnitInputs from './UnitInputs.svelte';
	import ModalMenu from './ModalMenu.svelte';

	let {
		employee,
		categoriasIncidencia
	}: {
		employee: Employee;
		categoriasIncidencia: CategoriaIncidencia[];
	} = $props();

	let categoriasIncidenciaMap = new Map<number, CategoriaIncidencia>(
		categoriasIncidencia.map((category) => [category.id, category])
	);
	let incidenciasMapByCategory = new Map<number, Incidencia>(
		employee.incidencias.map((incidencia) => [incidencia.category, incidencia])
	);

	onMount(() => {
		updateCategoryTotalMonetaryValuesByEmployee(employee);
		setEmployeeTotalsByCategoryType();
	});

	let employeeTotal = $derived.by(getEmployeeTotalByCategoryTypes);
	let incidenciaToEdit: Incidencia | null = $state(null);

	function openEditIncidenciaUnitMenu(incidencia: Incidencia, category: CategoriaIncidencia) {
		incidenciaToEdit = incidencia;
		if (!incidencia.unitMonetaryValue) {
			incidencia.unitMonetaryValue = category.unitMonetaryValue;
		}
		if (!incidencia.unit) {
			incidencia.unit = category.unit;
		}
	}

	function getEmployeeTotalByCategoryTypes() {
		let total = 0;
		for (const categoryType of selectedCategoryTypes.value) {
			const categoryTypeTotal = totals.byCategoryType.get(categoryType)?.get(employee.id);
			if (!categoryTypeTotal) continue;
			if (categoryType === 'deduccion') {
				total -= categoryTypeTotal;
			} else {
				total += categoryTypeTotal;
			}
		}
		return total;
	}

	function getIncidenciaTotalMonetaryValue(incidencia: Incidencia, category: CategoriaIncidencia) {
		const unitMonetaryValue = getIncidenciaUnitMonetaryValue(incidencia, category);
		return incidencia.amount * unitMonetaryValue;
	}
	function getIncidenciaUnitMonetaryValue(incidencia: Incidencia, category: CategoriaIncidencia) {
		let unit = incidencia.unit;
		if (!unit) {
			unit = category.unit;
		}
		if (unit === 'días') {
			return employee.salary / 5;
		} else if (unit === 'horas') {
			return employee.salary / 40;
		}
		let unitMonetaryValue = incidencia.unitMonetaryValue;
		if (!unitMonetaryValue) {
			unitMonetaryValue = category.unitMonetaryValue;
		}
		return unitMonetaryValue;
	}
	function updateIncidenciaAmount(incidencia: Incidencia, category: CategoriaIncidencia) {
		incidencia.amount = validateAmount(incidencia.amount);
		setEmployeeTotalsByCategoryType();
		setCategoryTotalByIncidencia(incidencia, category);
		totals.byCategory = new Map(totals.byCategory);
	}
	function setEmployeeTotalsByCategoryType() {
		for (const categoryType of categoryTypes) {
			totals.byCategoryType.get(categoryType)?.set(employee.id, 0);
		}
		for (const incidencia of employee.incidencias) {
			const category = categoriasIncidenciaMap.get(incidencia.category);
			if (!category) continue;
			let categoryTypeTotals = totals.byCategoryType.get(category.type);
			if (!categoryTypeTotals) {
				categoryTypeTotals = new Map([[employee.id, 0]]);
			}
			const incidenciaTotal = getIncidenciaTotalMonetaryValue(incidencia, category);
			const prevTotal = categoryTypeTotals.get(employee.id) ?? 0;
			categoryTypeTotals.set(employee.id, prevTotal + incidenciaTotal);
			totals.byCategoryType.set(category.type, categoryTypeTotals);
		}
		totals.byCategoryType = new Map(totals.byCategoryType);
	}
	function updateCategoryTotalMonetaryValuesByEmployee(employee: Employee) {
		for (const incidencia of employee.incidencias) {
			const category = categoriasIncidenciaMap.get(incidencia.category);
			if (!category) continue;
			setCategoryTotalByIncidencia(incidencia, category);
		}
		totals.byCategory = new Map(totals.byCategory);
	}
	function setCategoryTotalByIncidencia(incidencia: Incidencia, category: CategoriaIncidencia) {
		let incidenciaTotalMonetaryValue = getIncidenciaTotalMonetaryValue(incidencia, category);
		const categoryIncidencias = totals.byCategory.get(category.id);
		if (categoryIncidencias) {
			categoryIncidencias.set(employee.id, incidenciaTotalMonetaryValue);
		} else {
			totals.byCategory.set(
				incidencia.category,
				new Map([[employee.id, incidenciaTotalMonetaryValue]])
			);
		}
	}
</script>

{#if incidenciaToEdit}
	<ModalMenu
		title="Editar Unidad"
		onAccept={() => {
			if (!incidenciaToEdit) return;
			const category = categoriasIncidenciaMap.get(incidenciaToEdit.category);
			if (!category) return;
			updateIncidenciaAmount(incidenciaToEdit, category);
			incidenciaToEdit = null;
		}}
		onCancel={() => (incidenciaToEdit = null)}
	>
		<div class="flex flex-col gap-2">
			<UnitInputs
				bind:unit={incidenciaToEdit.unit}
				bind:unitMonetaryValue={incidenciaToEdit.unitMonetaryValue}
			/>
		</div>
	</ModalMenu>
{/if}

<tr class="odd:bg-white even:bg-gray-50">
	<td class="t-cell sticky left-0 bg-gray-200 text-nowrap">{employee.name}</td>
	<td class="t-cell text-nowrap">{formatMonetaryValue(employee.salary)}</td>
	{#each categoriasIncidencia as category}
		{#if selectedCategoryTypes.value.includes(category.type)}
			{@const incidencia = incidenciasMapByCategory.get(category.id)}
			<td class="t-cell text-nowrap">
				{#if incidencia}
					<div class="flex w-full items-center gap-0.75">
						<input
							type="number"
							step=".01"
							bind:value={incidencia.amount}
							class="rounded-md border border-gray-500 px-2 py-1"
							oninput={() => updateIncidenciaAmount(incidencia, category)}
							style="width: {`${(incidencia.amount?.toString().length || 1) + 4}ch`}; min-width: 8ch;"
						/>
						{#if incidencia.unit}
							{incidencia.unit}
						{:else}
							{category.unit}
						{/if}
						{#if category.unitMonetaryValue !== 1}
							<div class="ml-auto flex flex-col">
								<div class="ml-auto flex items-center">
									<span class="text-sm leading-none text-gray-500">
										{formatMonetaryValue(getIncidenciaUnitMonetaryValue(incidencia, category))}
									</span>
									<button
										class="ml-0.5 w-4"
										tabindex="-1"
										onclick={() => {
											openEditIncidenciaUnitMenu(incidencia, category);
										}}
									>
										<img class="bg-white" src="/EditIcon.svg" alt="" />
									</button>
								</div>
								<span class="leading-none text-gray-500">
									{formatMonetaryValue(getIncidenciaTotalMonetaryValue(incidencia, category))}
								</span>
							</div>
						{/if}
					</div>
				{/if}
			</td>
		{/if}
	{/each}
	{#each selectedCategoryTypes.value as categoryType}
		<td class="t-cell text-nowrap">
			{formatMonetaryValue(totals.byCategoryType.get(categoryType)?.get(employee.id) ?? 0)}
		</td>
	{/each}
	<td class="t-cell sticky right-0 bg-gray-200 text-nowrap">
		{formatMonetaryValue(employeeTotal)}
	</td>
</tr>
