<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import { selectedCategoryTypes, totals } from '$lib/stores.svelte';
	import { formatMonetaryValue, getCategoryTypeLabel } from '$lib/utils';
	import AddCategory from './AddCategory.svelte';
	import AddEmployee from './AddEmployee.svelte';
	import MainTable from './MainTable.svelte';
	import * as XLSX from 'xlsx';

	let { data } = $props();
	let employees = $state(data.employees);
	let incidenceCategories = $state(data.incidenceCategories);
	let totalsByCategoryType = $derived.by(getTotalsByCategoryType);

	function getTotalSalary() {
		let total = 0;
		for (const employee of employees) {
			total += employee.salary;
		}
		return total;
	}
	function getTotalsByCategoryType() {
		const totalsByCategoryType = new Map<string, number>([['all', 0]]);
		for (const categoryType of selectedCategoryTypes.value) {
			const categoryTypeTotal = getCategoryTypeTotalMonetaryValue(categoryType);
			totalsByCategoryType.set(categoryType, categoryTypeTotal);
			const prevTotal = totalsByCategoryType.get('all') ?? 0;
			if (categoryType === 'deduccion') {
				totalsByCategoryType.set('all', prevTotal - categoryTypeTotal);
			} else {
				totalsByCategoryType.set('all', prevTotal + categoryTypeTotal);
			}
		}

		return totalsByCategoryType;
	}
	function getCategoryTypeTotalMonetaryValue(categoryType: string) {
		let total = 0;
		const categoryTypeTotals = totals.byCategoryType.get(categoryType);
		if (!categoryTypeTotals) return 0;
		for (const [employeeId, employeeCategoryTypeTotal] of categoryTypeTotals) {
			total += employeeCategoryTypeTotal;
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

	function generateExcelReport() {
		const headers = [
			'Empleado',
			'Salario',
			...incidenceCategories
				.filter((cat) => selectedCategoryTypes.value.includes(cat.type))
				.map((cat) => cat.concept),
			...selectedCategoryTypes.value.map((type) => `Total ${getCategoryTypeLabel(type)}`),
			'Total'
		];

		const data = [headers];

		// Prepare rows
		for (const employee of employees) {
			const row = [employee.name, formatMonetaryValue(employee.salary)];

			for (const category of incidenceCategories) {
				if (!selectedCategoryTypes.value.includes(category.type)) continue;
				const incidencia = employee.incidencias.find((i) => i.category === category.id);
				if (incidencia) {
					const unit = incidencia.unit || category.unit;
					const unitMonetaryValue = incidencia.unitMonetaryValue ?? category.unitMonetaryValue;
					const total = incidencia.amount * unitMonetaryValue || 0;
					row.push(`${incidencia.amount} (${formatMonetaryValue(total)})`);
				} else {
					row.push('');
				}
			}

			for (const categoryType of selectedCategoryTypes.value) {
				// You may want to use your getCategoryTypeTotalMonetaryValue here
				const typeTotal = totals.byCategoryType.get(categoryType)?.get(employee.id) ?? 0;
				row.push(formatMonetaryValue(typeTotal));
			}

			// Employee total
			const employeeTotal = (() => {
				let total = 0;
				for (const categoryType of selectedCategoryTypes.value) {
					const categoryTypeTotal = totals.byCategoryType.get(categoryType)?.get(employee.id) ?? 0;
					if (categoryType === 'deduccion') {
						total -= categoryTypeTotal;
					} else {
						total += categoryTypeTotal;
					}
				}
				return formatMonetaryValue(total);
			})();
			row.push(employeeTotal);

			data.push(row);
		}

		// Add totals row
		const totalsRow = ['Total', formatMonetaryValue(getTotalSalary())];
		for (const category of incidenceCategories) {
			if (!selectedCategoryTypes.value.includes(category.type)) continue;
			totalsRow.push(formatMonetaryValue(getCategoryTotalMonetaryValue(category.id)));
		}
		for (const categoryType of selectedCategoryTypes.value) {
			totalsRow.push(formatMonetaryValue(totalsByCategoryType.get(categoryType) ?? 0));
		}
		totalsRow.push(formatMonetaryValue(totalsByCategoryType.get('all') ?? 0));
		data.push(totalsRow);

		// Calculate column widths
		const colWidths = headers.map(
			(_, colIdx) =>
				Math.max(
					...data.map((row) => (row[colIdx] ? row[colIdx].toString().length : 10)),
					headers[colIdx].length
				) + 2 // add some padding
		);

		// Create worksheet and set column widths
		const ws = XLSX.utils.aoa_to_sheet(data);
		ws['!cols'] = colWidths.map((w) => ({ wch: w }));

		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

		XLSX.writeFile(wb, 'reporte.xlsx');
	}
</script>

<div class="fixed top-0 left-0 z-20 flex gap-2 p-2 font-bold text-white">
	{#each categoryTypes as category}
		<label
			class={`${category} flex cursor-pointer items-center gap-1.5 rounded-lg p-2 hover:scale-105`}
		>
			<input
				type="checkbox"
				class="rounded-lg"
				bind:group={selectedCategoryTypes.value}
				value={category}
			/>
			{getCategoryTypeLabel(category)}
		</label>
	{/each}
	<button
		class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-400 px-4 py-2 hover:scale-105"
		onclick={() => {
			selectedCategoryTypes.value = categoryTypes;
		}}
	>
		Todo
	</button>
	<button
		class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-400 px-4 py-2 hover:scale-105"
		onclick={() => {
			selectedCategoryTypes.value = [];
		}}
	>
		Ninguno
	</button>
</div>

<div class="pt-16">
	<MainTable
		{employees}
		{incidenceCategories}
		{getTotalSalary}
		{getCategoryTotalMonetaryValue}
		{getCategoryTypeTotalMonetaryValue}
		{totalsByCategoryType}
	/>
</div>

<div class="p-2">
	<AddCategory />
	<AddEmployee />
	<button
		class="mb-4 rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
		onclick={generateExcelReport}
	>
		Generar Reporte
	</button>
</div>
<button
class="fixed top-4 right-4 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
    onclick={async () => {
        await fetch('/api/logout', { method: 'POST' });
        location.href = '/login';
    }}
>
    Cerrar sesión
</button>
