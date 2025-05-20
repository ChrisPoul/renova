<script lang="ts">
	import EmployeeRow from './EmployeeRow.svelte';
	import { selectedParentCategories, totals } from '$lib/stores.svelte';
	import { formatMonetaryValue, getParentCategoryLabel } from '$lib/utils';
	import * as XLSX from 'xlsx';

	let {
		categoriasIncidencia,
		employees,
	}: {
		categoriasIncidencia: CategoriaIncidencia[];
		employees: Employee[];
	} = $props();

	let totalMonetaryValue = $derived.by(getTotalMonetaryValueByEmployees);

	function getTotalSalary() {
		let total = 0;
		for (const employee of employees) {
			total += employee.salary;
		}
		return total;
	}
	function getTotalMonetaryValueByEmployees() {
		let total = 0;
		for (const [employeeId, employeeTotal] of totals.byEmployee) {
			total += employeeTotal;
		}
		return total;
	}
	function getCategoryTotalMonetaryValue(categoryId: number) {
		let total = 0;
		const incidenciaTotals = totals.byCategory.get(categoryId);
		if (!incidenciaTotals) return 0;
		for (const [employeeId, incidenciaTotal] of incidenciaTotals) {
			total += incidenciaTotal;
		}
		return total;
	}
	function getParentCategoryTotalMonetaryValue(parentCategory: ParentCategory) {
		let total = 0;
		const parentCategoryTotals = totals.byParentCategory.get(parentCategory);
		if (!parentCategoryTotals) return 0;
		for (const [employeeId, employeeTotalInParentCategory] of parentCategoryTotals) {
			total += employeeTotalInParentCategory;
		}
		return total;
	}

	function generateExcelReport() {
		// Prepare data for the Excel file
		const data = [];
		const headers = ['Empleado', 'Salario', ...categoriasIncidencia.map((c) => c.concept), 'Total'];
		data.push(headers);

		// Add employee rows
		for (const employee of employees) {
			const row = [
				employee.name,
				employee.salary,
				...categoriasIncidencia.map((category) => {
					const incidenciaTotalMonetaryValue = totals.byCategory.get(category.id)?.get(employee.id);
					return incidenciaTotalMonetaryValue ?? 0;
				}),
				totals.byEmployee.get(employee.id) ?? 0
			];
			data.push(row);
		}

		// Add totals row
		const totalsRow = [
			'Total',
			getTotalSalary(),
			...categoriasIncidencia.map((category) => {
				return getCategoryTotalMonetaryValue(category.id);
			}),
			totalMonetaryValue
		];
		data.push(totalsRow);

		// Create a worksheet and workbook
		const worksheet = XLSX.utils.aoa_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

		// Export the Excel file
		XLSX.writeFile(workbook, 'reporte.xlsx');
	}
</script>

<div class="relative overflow-auto">
	<table class="m-2 border-collapse border border-gray-500">
		<thead>
			<tr class="bg-gray-100">
				<th class="sticky left-0 border border-gray-500 bg-gray-300 px-4 py-2">Empleado</th>
				<th class="border border-gray-500 bg-gray-300 px-4 py-2">Salario</th>
				{#each categoriasIncidencia as category}
					{#if selectedParentCategories.value.includes(category.parentCategory)}
						<th class={`border border-gray-700 px-4 py-2 text-nowrap ${category.parentCategory}`}>
							{category.concept}
							{#if category.unitMonetaryValue !== 1 && category.unitMonetaryValue !== 0}
								<span class="pl-1 text-sm font-normal">
									{formatMonetaryValue(category.unitMonetaryValue)}
								</span>
							{/if}
						</th>
					{/if}
				{/each}
				{#each selectedParentCategories.value as parentCategory}
					<th class={`border border-gray-700 px-4 py-2 text-nowrap ${parentCategory}-opaco`}>
						Total {getParentCategoryLabel(parentCategory)}
					</th>
				{/each}
				<th class="sticky right-0 border border-gray-500 bg-gray-300 px-4 py-2">Total</th>
			</tr>
		</thead>
		<tbody>
			{#each employees as employee}
				<EmployeeRow {employee} {categoriasIncidencia} />
			{/each}
			<tr class="bg-gray-100">
				<td class="sticky left-0 border border-gray-500 bg-gray-300 px-4 py-2 font-bold">Total</td>
				<td class="border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap">
					{formatMonetaryValue(getTotalSalary())}
				</td>
				{#each categoriasIncidencia as category}
					{#if selectedParentCategories.value.includes(category.parentCategory)}
						<td class="border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap">
							{formatMonetaryValue(getCategoryTotalMonetaryValue(category.id))}
						</td>
					{/if}
				{/each}
        {#each selectedParentCategories.value as parentCategory}
          <td class={`border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap ${parentCategory}-opaco`}>
            {formatMonetaryValue(getParentCategoryTotalMonetaryValue(parentCategory))}
          </td>
        {/each}
				<td class="sticky right-0 border border-gray-500 bg-gray-300 px-4 py-2 text-nowrap">
					{formatMonetaryValue(totalMonetaryValue)}
				</td>
			</tr>
		</tbody>
	</table>
</div>

<button
	class="mb-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
	onclick={generateExcelReport}
>
	Generar Reporte
</button>
