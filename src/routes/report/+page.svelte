<script lang="ts">
	import MainTable from '$lib/components/table/MainTable.svelte';
	import {
		employees,
		incidenceCells,
		isReadOnly,
		totals,
		selectedWeek,
		categoriesByType,
		categories
	} from '$lib/stores.svelte';
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
		const baseHeaders = ['Empleado', 'Área', 'Puesto', 'Salario'];
		const headers = [...baseHeaders];

		for (const [categoryType, categoriesInType] of categoriesByType.value) {
			for (const category of categoriesInType) {
				headers.push(category.concept);
			}
			headers.push(`Total ${getCategoryTypeLabel(categoryType)}`);
		}
		headers.push('Total');

		const headerRow = worksheet.addRow(headers);

		// Apply header styling
		let colIdx = 1;
		for (const header of baseHeaders) {
			const cell = headerRow.getCell(colIdx);
			styleExcelCell(cell, defaultHeaderColor)
			colIdx++;
		}
		for (const [categoryType, categoriesInType] of categoriesByType.value) {
			const color = categoryTypeColors[categoryType as keyof typeof categoryTypeColors]
			for (const category of categoriesInType) {
				const cell = headerRow.getCell(colIdx);
				styleExcelCell(cell, color)
				colIdx++;
			}
			const totalCategoryTypeCell = headerRow.getCell(colIdx);
			styleExcelCell(totalCategoryTypeCell, color)
			colIdx++;
		}
		const totalCell = headerRow.getCell(colIdx);
		styleExcelCell(totalCell, defaultHeaderColor)

		// Add data rows
		let totalSalary = 0;
		for (const [employeeId, employee] of employees.value) {
			totalSalary += employee.salary;
			const rowData = [
				employee.name,
				employee.area,
				employee.puesto,
				formatMonetaryValue(employee.salary)
			];

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

			rowData.push(formatMonetaryValue(totals.value.employeeTotals.get(employeeId)!));
			worksheet.addRow(rowData);
		}

		// Add totals row
		const totalsRowData = ['Total', '', '', formatMonetaryValue(totalSalary)];

		for (const [categoryType, categoriesInType] of categoriesByType.value) {
			for (const category of categoriesInType) {
				const total = totals.value.categoryTotals.get(category.id)!
				totalsRowData.push(`${total.amount} (${formatMonetaryValue(total.monetaryValue)})`);
			}
			totalsRowData.push(
				formatMonetaryValue(totals.value.categoryTypeGrandTotals.get(categoryType)!)
			);
		}

		totalsRowData.push(formatMonetaryValue(totals.value.grandTotal));

		const excelTotalsRow = worksheet.addRow(totalsRowData);
		excelTotalsRow.eachCell((cell) => {
			styleExcelCell(cell, 'FFE5E7EB')
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
