<script lang="ts">
	import EmployeeRow from './EmployeeRow.svelte';
	import { selectedCategoryTypes, totals } from '$lib/stores.svelte';
	import { formatMonetaryValue, getCategoryTypeLabel } from '$lib/utils';
	import * as XLSX from 'xlsx';
	import EditCategory from './EditCategory.svelte';

	let {
		incidenceCategories,
		employees
	}: {
		incidenceCategories: IncidenceCategory[];
		employees: Employee[];
	} = $props();

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

<div class="relative overflow-auto">
	<table class="m-2 border-collapse border border-gray-500">
		<thead>
			<tr class="bg-gray-100">
				<th class="t-cell sticky left-0 bg-gray-300">Empleado</th>
				<th class="t-cell bg-gray-200">Salario</th>
				{#each incidenceCategories as category}
					{#if selectedCategoryTypes.value.includes(category.type)}
						<th class={`t-cell ${category.type}`}>
							{category.concept}
							<span class="text-sm font-normal">
								{formatMonetaryValue(category.unitMonetaryValue)}
							</span>
							<EditCategory {category} />
						</th>
					{/if}
				{/each}
				{#each selectedCategoryTypes.value as categoryType}
					<th class={`t-cell ${categoryType}`}>
						Total {getCategoryTypeLabel(categoryType)}
					</th>
				{/each}
				<th class="t-cell sticky right-0 bg-gray-300">Total</th>
			</tr>
		</thead>
		<tbody>
			{#each employees as employee}
				<EmployeeRow {employee} {incidenceCategories} />
			{/each}
			<tr class="bg-gray-100">
				<td class="t-cell sticky left-0 bg-gray-300 font-bold">Total</td>
				<td class="t-cell bg-gray-200 text-nowrap">
					{formatMonetaryValue(getTotalSalary())}
				</td>
				{#each incidenceCategories as category}
					{#if selectedCategoryTypes.value.includes(category.type)}
						<td class={`t-cell text-nowrap ${category.type}-opaco`}>
							{formatMonetaryValue(getCategoryTotalMonetaryValue(category.id))}
						</td>
					{/if}
				{/each}
				{#each selectedCategoryTypes.value as categoryType}
					<td class={`t-cell text-nowrap ${categoryType}-opaco`}>
						{formatMonetaryValue(totalsByCategoryType.get(categoryType) ?? 0)}
					</td>
				{/each}
				<td class="t-cell sticky right-0 bg-gray-300 text-nowrap">
					{formatMonetaryValue(totalsByCategoryType.get('all') ?? 0)}
				</td>
			</tr>
		</tbody>
	</table>
</div>

<button
	class="mb-4 rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
	onclick={generateExcelReport}
>
	Generar Reporte
</button>
