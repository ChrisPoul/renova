<script lang="ts">
	import MainTable from '$lib/components/table/MainTable.svelte';
	import { employees, categories, incidenceCells, isReadOnly, selectedCategoryTypes, totals, selectedWeek } from '$lib/stores.svelte';
	import ExcelJS from 'exceljs';
	import { formatMonetaryValue, getCategoryTypeLabel } from '$lib/utils';

	let { data } = $props();
	employees.value = data.employees;
	categories.value = data.categories;
	incidenceCells.value = data.incidenceCells;

	isReadOnly.value = true;

	let startWeek = $state(data.startWeek);
	let endWeek = $state(data.endWeek);

	function generateReport() {
		window.location.href = `/report?startWeek=${startWeek}&endWeek=${endWeek}`;
	}

	function generateExcelReport() {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Reporte');

		// Define category type colors (matching your CSS)
		const categoryTypeColors = {
			destajo: 'FF7DC8F3',
			bono: 'FFFBBF24',
			deduccion: 'FFF87171'
		};
		const defaultHeaderColor = 'FFE5E7EB'; // light gray

		// Prepare headers
		const headers = [
			'Empleado',
			'Área',
			'Puesto',
			'Salario'
		];

		const categoriesInOrder: Category[] = [];
		for (const categoryType of selectedCategoryTypes.value) {
			for (const category of categories.value.values()) {
				if (category.type === categoryType) {
					categoriesInOrder.push(category);
					headers.push(category.concept);
				}
			}
		}

		for (const categoryType of selectedCategoryTypes.value) {
			headers.push(`Total ${getCategoryTypeLabel(categoryType)}`);
		}
		headers.push('Total');

		const headerRow = worksheet.addRow(headers);

		// Apply header styling
		let colIdx = 1;
		for (const header of headers) {
			const cell = headerRow.getCell(colIdx);
			const category = categoriesInOrder.find((cat) => cat.concept === header);
			let color = defaultHeaderColor;
			if (category && categoryTypeColors[category.type]) {
				color = categoryTypeColors[category.type];
			} else if (header.startsWith('Total ')) {
				const typeFromHeader = header.replace('Total ', '').toLowerCase();
				const originalType = Object.keys(categoryTypeColors).find(key => getCategoryTypeLabel(key) === typeFromHeader);
				if (originalType && categoryTypeColors[originalType]) {
					color = categoryTypeColors[originalType];
				}
			}

			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: color }
			};
			cell.font = { bold: true };
			colIdx++;
		}

		// Add data rows
		for (const [employeeId, employee] of employees.value) {
			const rowData = [
				employee.name,
				employee.area,
				employee.puesto,
				formatMonetaryValue(employee.salary)
			];

			for (const category of categoriesInOrder) {
				const incidenceCell = incidenceCells.value.get(category.id)?.get(employeeId);
				if (incidenceCell) {
					rowData.push(`${incidenceCell.incidence.amount} (${formatMonetaryValue(incidenceCell.totalMonetaryValue)})`);
				} else {
					rowData.push('');
				}
			}

			for (const categoryType of selectedCategoryTypes.value) {
				const typeTotal = totals.value.categoryTypeTotals.get(categoryType)?.get(employeeId) ?? 0;
				rowData.push(formatMonetaryValue(typeTotal));
			}

			rowData.push(formatMonetaryValue(totals.value.employeeTotals.get(employeeId) ?? 0));
			worksheet.addRow(rowData);
		}

		// Add totals row
		const totalsRowData = [
			'Total',
			'',
			'',
			formatMonetaryValue(totals.value.employeeTotals.get('all') ?? 0) // Assuming 'all' key for total salary if needed
		];

		for (const category of categoriesInOrder) {
			const total = totals.value.categoryTotals.get(category.id) ?? { amount: 0, monetaryValue: 0 };
			totalsRowData.push(`${total.amount} (${formatMonetaryValue(total.monetaryValue)})`);
		}

		for (const categoryType of selectedCategoryTypes.value) {
			totalsRowData.push(formatMonetaryValue(totals.value.categoryTypeGrandTotals.get(categoryType) ?? 0));
		}
		totalsRowData.push(formatMonetaryValue(totals.value.grandTotal));

		const excelTotalsRow = worksheet.addRow(totalsRowData);
		excelTotalsRow.eachCell((cell) => {
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FFE5E7EB' } // light gray
			};
			cell.font = { bold: true };
		});

		// Auto-size columns
		worksheet.columns.forEach((column) => {
			let maxLength = 10;
			column.eachCell({ includeEmpty: true }, (cell) => {
				const cellValue = cell.value ? cell.value.toString() : '';
				maxLength = Math.max(maxLength, cellValue.length + 2);
			});
			column.width = maxLength;
		});

		// Download the file
		workbook.xlsx.writeBuffer().then((buffer) => {
			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'reporte.xlsx';
			a.click();
			URL.revokeObjectURL(url);
		});
	}
</script>

<svelte:head>
	<title>Renova - Reporte</title>
</svelte:head>

<section class="flex flex-col gap-4 p-4">
	<div class="relative">
		<a
			href="/"
			class="absolute top-0 left-0 rounded-lg bg-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-300"
		>
			← Regresar
		</a>
		<h1 class="pb-4 text-center text-4xl font-semibold">Reporte</h1>
		<div class="flex gap-4">
			<div>
				<label for="start-week">Start Week</label>
				<input type="week" id="start-week" bind:value={startWeek} />
			</div>
			<div>
				<label for="end-week">End Week</label>
				<input type="week" id="end-week" bind:value={endWeek} />
			</div>
			<button
				class="self-end rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
				onclick={generateReport}
			>
				Generar Reporte
			</button>
		</div>
	</div>
	<MainTable />
	<button
		class="mb-4 self-start rounded-lg bg-green-500 px-3 py-2 text-white hover:bg-green-600"
		onclick={generateExcelReport}
	>
		Generar Reporte Excel
	</button>
</section>