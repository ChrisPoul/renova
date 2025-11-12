<script lang="ts">
	import MainTable from '$lib/components/table/MainTable.svelte';
	import {
		employees,
		incidenceCells,
		isReadOnly,
		totals,
		selectedWeek,
		categoriesByType,
		categories,
		resumen
	} from '$lib/stores.svelte';
	import ExcelJS from 'exceljs';
	import { formatMonetaryValue, getCategoryTypeLabel } from '$lib/utils';
import { EMPLOYEE_COLUMNS, EMPLOEYEE_WEEK_COLUMNS, EMPLOYEE_RESUMEN_COLUMNS } from '$lib/constants';

	let { data } = $props();
	employees.value = data.employees;
	categories.value = data.categories;
	incidenceCells.value = data.incidenceCells;

	isReadOnly.value = true;

	let startDate = $state(data.startDate);
	let endDate = $state(data.endDate);

	function generateReport() {
		window.location.href = `/report?startDate=${startDate}&endDate=${endDate}`;
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
		const baseHeaders = EMPLOYEE_COLUMNS.map((column) => column.label);
		const weekHeaders = EMPLOEYEE_WEEK_COLUMNS.map((column) => column.label);
		const headers = [...baseHeaders, ...weekHeaders];

		for (const [categoryType, categoriesInType] of categoriesByType.value) {
			for (const category of categoriesInType) {
				headers.push(category.concept);
			}
			headers.push(`Total ${getCategoryTypeLabel(categoryType)}`);
		}
		for (const column of EMPLOYEE_RESUMEN_COLUMNS) {
			headers.push(column.label);
		}
		headers.push('Total');

		const headerRow = worksheet.addRow(headers);

		// Apply header styling
		let colIdx = 1;
		for (const header of baseHeaders) {
			const cell = headerRow.getCell(colIdx);
			styleExcelCell(cell, defaultHeaderColor);
			colIdx++;
		}
		for (const _ of EMPLOEYEE_WEEK_COLUMNS) {
			const cell = headerRow.getCell(colIdx);
			styleExcelCell(cell, defaultHeaderColor);
			colIdx++;
		}
		for (const [categoryType, categoriesInType] of categoriesByType.value) {
			const color = categoryTypeColors[categoryType as keyof typeof categoryTypeColors];
			for (const category of categoriesInType) {
				const cell = headerRow.getCell(colIdx);
				styleExcelCell(cell, color);
				colIdx++;
			}
			const totalCategoryTypeCell = headerRow.getCell(colIdx);
			styleExcelCell(totalCategoryTypeCell, color);
			colIdx++;
		}
		for (const column of EMPLOYEE_RESUMEN_COLUMNS) {
			const cell = headerRow.getCell(colIdx);
			styleExcelCell(cell, defaultHeaderColor);
			colIdx++;
		}
		const totalCell = headerRow.getCell(colIdx);
		styleExcelCell(totalCell, defaultHeaderColor);

		// Add data rows
		for (const [employeeId, employee] of employees.value) {
			const rowData = EMPLOYEE_COLUMNS.map(
				(column) => employee[column.key as keyof Employee] ?? ''
			);

			for (const column of EMPLOEYEE_WEEK_COLUMNS) {
				const value = employee[column.key as keyof Employee] ?? 0;
				if (column.format === 'currency') {
					rowData.push(formatMonetaryValue(Number(value ?? 0)));
				} else {
					rowData.push(value ?? '');
				}
			}

			for (const [categoryType, categoriesInType] of categoriesByType.value) {
				for (const category of categoriesInType) {
					const incidenceCell = incidenceCells.value.get(category.id)?.get(employeeId) || {
						incidence: { amount: 0, monetaryValue: 0 },
						totalMonetaryValue: 0
					};
					rowData.push(
						`${incidenceCell.incidence.amount} (${formatMonetaryValue(
							incidenceCell.totalMonetaryValue
						)})`
					);
				}
				const typeTotal = totals.value.categoryTypeTotals.get(categoryType)!.get(employeeId)!;
				rowData.push(formatMonetaryValue(typeTotal));
			}

			const resumenEmployee = resumen.value.employees.get(employeeId);
			for (const column of EMPLOYEE_RESUMEN_COLUMNS) {
				const value = resumenEmployee?.[column.key as keyof typeof resumenEmployee] ?? 0;
				if (column.format === 'currency') {
					rowData.push(formatMonetaryValue(Number(value ?? 0)));
				} else {
					rowData.push(value);
				}
			}

			rowData.push(formatMonetaryValue(totals.value.employeeTotals.get(employeeId)!));
			worksheet.addRow(rowData);
		}

		// Add totals row
		const totalsRowData: string[] = EMPLOYEE_COLUMNS.map((column, index) => {
			if (index === 0) return 'Total';
			return '';
		});
		for (const column of EMPLOEYEE_WEEK_COLUMNS) {
			const value = totals.value.employeeWeekTotals.get(column.sumKey) ?? 0;
			totalsRowData.push(
				column.format === 'currency'
					? formatMonetaryValue(Number(value ?? 0))
					: value.toString()
			);
		}
		for (const [categoryType, categoriesInType] of categoriesByType.value) {
			for (const category of categoriesInType) {
				const total = totals.value.categoryTotals.get(category.id)!;
				totalsRowData.push(`${total.amount} (${formatMonetaryValue(total.monetaryValue)})`);
			}
			totalsRowData.push(
				formatMonetaryValue(totals.value.categoryTypeGrandTotals.get(categoryType)!)
			);
		}

		for (const column of EMPLOYEE_RESUMEN_COLUMNS) {
			const value =
				resumen.value.grandTotals?.[column.key as keyof typeof resumen.value.grandTotals] ?? 0;
			totalsRowData.push(
				column.format === 'currency' ? formatMonetaryValue(Number(value ?? 0)) : value.toString()
			);
		}

		totalsRowData.push(formatMonetaryValue(totals.value.grandTotal));

		const excelTotalsRow = worksheet.addRow(totalsRowData);
		excelTotalsRow.eachCell((cell) => {
			styleExcelCell(cell, 'FFE5E7EB');
		});

		// Auto-size columns
		worksheet.columns.forEach((column) => {
			let maxLength = 10;
			column.eachCell!({ includeEmpty: true }, (cell) => {
				const currentLength = cell.value ? cell.value.toString().length : 0;
				if (currentLength > maxLength) {
					maxLength = currentLength;
				}
			});
			column.width = maxLength + 2;
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

	function styleExcelCell(cell: ExcelJS.Cell, color: string) {
		cell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: color } // light gray
		};
		cell.font = { bold: true };
	}
</script>

<svelte:head>
	<title>Renova - Reporte</title>
</svelte:head>

<section class="flex flex-col gap-4 p-4">
	<div class="relative">
		<a
			href={selectedWeek.value ? `/?weekId=${selectedWeek.value.id}` : '/'}
			class="absolute top-0 left-0 rounded-lg bg-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-300"
		>
			← Regresar
		</a>
		<h1 class="pb-4 text-center text-4xl font-semibold">Reporte</h1>
		<div class="flex gap-4">
			<div>
				<label for="start-date">Start Date</label>
				<input type="date" id="start-date" bind:value={startDate} />
			</div>
			<div>
				<label for="end-date">End Date</label>
				<input type="date" id="end-date" bind:value={endDate} />
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
