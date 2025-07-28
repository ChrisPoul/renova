<script lang="ts">
	import MainTable from '$lib/components/table/MainTable.svelte';
	import { employees, categories, incidenceCells, isReadOnly } from '$lib/stores.svelte';
	import ExcelJS from 'exceljs';

	let { data } = $props();
	employees.value = data.employees;
	categories.value = data.categories;
	incidenceCells.value = data.incidenceCells;

	isReadOnly.value = true;

	let startWeek = $state('');
	let endWeek = $state('');

	function generateReport() {
		window.location.href = `/report?startWeek=${startWeek}&endWeek=${endWeek}`;
	}

	function generateExcelReport() {
		// const workbook = new ExcelJS.Workbook();
		// const worksheet = workbook.addWorksheet('Reporte');
		// const headers = [
		// 	'Empleado',
		// 	'Área',
		// 	'Puesto',
		// 	'Salario',
		// 	...categories
		// 		.filter((cat) => selectedCategoryTypes.value.includes(cat.type))
		// 		.map((cat) => cat.concept),
		// 	...selectedCategoryTypes.value.map((type) => `Total ${getCategoryTypeLabel(type)}`),
		// 	'Total'
		// ];
		// const headerRow = worksheet.addRow(headers);
		// // Category type colors matching your CSS
		// const defaultHeaderColor = 'FFE5E7EB'; // light gray
		// let colIdx = 1;
		// for (const header of headers) {
		// 	const cat = categories.find((c) => c.concept === header);
		// 	let color = defaultHeaderColor;
		// 	if (cat && categoryTypeColors[cat.type]) {
		// 		color = categoryTypeColors[cat.type];
		// 	}
		// 	worksheet.getColumn(colIdx).width = Math.max(header.length + 2, 12);
		// 	const cell = headerRow.getCell(colIdx);
		// 	cell.fill = {
		// 		type: 'pattern',
		// 		pattern: 'solid',
		// 		fgColor: { argb: color }
		// 	};
		// 	cell.font = { bold: true };
		// 	colIdx++;
		// }
		// // Find the column indexes for each category type total column
		// const totalColIndexes = selectedCategoryTypes.value.map((type) => {
		// 	const header = `Total ${getCategoryTypeLabel(type)}`;
		// 	return headers.indexOf(header) + 1; // exceljs columns are 1-based
		// });
		// // Color those columns in all rows (including the totals row)
		// worksheet.eachRow((row) => {
		// 	totalColIndexes.forEach((colIdx, i) => {
		// 		const cell = row.getCell(colIdx);
		// 		cell.fill = {
		// 			type: 'pattern',
		// 			pattern: 'solid',
		// 			fgColor: { argb: categoryTypeColors[selectedCategoryTypes.value[i]] }
		// 		};
		// 	});
		// });
		// // Add data rows
		// for (const employee of employees) {
		// 	const row = [
		// 		employee.name,
		// 		employee.area,
		// 		employee.puesto,
		// 		formatMonetaryValue(employee.salary)
		// 	];
		// 	for (const category of categories) {
		// 		if (!selectedCategoryTypes.value.includes(category.type)) continue;
		// 		const incidence = employee.incidences.find((i) => i.categoryId === category.id);
		// 		if (incidence) {
		// 			const unit = incidence.unit || category.unit;
		// 			const unitMonetaryValue = incidence.unitMonetaryValue ?? category.unitMonetaryValue;
		// 			const total = incidence.amount * unitMonetaryValue || 0;
		// 			row.push(`${incidence.amount} (${formatMonetaryValue(total)})`);
		// 		} else {
		// 			row.push('');
		// 		}
		// 	}
		// 	for (const categoryType of selectedCategoryTypes.value) {
		// 		const typeTotal = totals.categoryTypes.get(categoryType)?.get(employee.id) ?? 0;
		// 		row.push(formatMonetaryValue(typeTotal));
		// 	}
		// 	const employeeTotal = (() => {
		// 		let total = 0;
		// 		for (const categoryType of selectedCategoryTypes.value) {
		// 			const categoryTypeTotal = totals.categoryTypes.get(categoryType)?.get(employee.id) ?? 0;
		// 			if (categoryType === 'deduccion') {
		// 				total -= categoryTypeTotal;
		// 			} else {
		// 				total += categoryTypeTotal;
		// 			}
		// 		}
		// 		return formatMonetaryValue(total);
		// 	})();
		// 	row.push(employeeTotal);
		// 	worksheet.addRow(row);
		// }
		// // --- Add totals row at the end ---
		// const totalsRow = [
		// 	'Total',
		// 	'', // Área
		// 	'', // Puesto
		// 	formatMonetaryValue(getTotalSalary())
		// ];
		// for (const category of categories) {
		// 	if (!selectedCategoryTypes.value.includes(category.type)) continue;
		// 	const { amount, monetaryValue } = getCategoryTotalMonetaryValueAndAmount(category.id);
		// 	totalsRow.push(`${amount} (${formatMonetaryValue(monetaryValue)})`);
		// }
		// for (const categoryType of selectedCategoryTypes.value) {
		// 	totalsRow.push(formatMonetaryValue(totalsByCategoryType.get(categoryType) ?? 0));
		// }
		// // Grand total (all)
		// totalsRow.push(formatMonetaryValue(totalsByCategoryType.get('all') ?? 0));
		// const excelTotalsRow = worksheet.addRow(totalsRow);
		// // Color the entire totals row in gray
		// excelTotalsRow.eachCell((cell) => {
		// 	cell.fill = {
		// 		type: 'pattern',
		// 		pattern: 'solid',
		// 		fgColor: { argb: 'FFE5E7EB' } // light gray
		// 	};
		// });
		// // Optionally, color the "Total" cell
		// excelTotalsRow.getCell(1).fill = {
		// 	type: 'pattern',
		// 	pattern: 'solid',
		// 	fgColor: { argb: 'FFE5E7EB' }
		// };
		// // Auto-size columns based on the max length of their contents
		// worksheet.columns.forEach((column) => {
		// 	let maxLength = 10; // minimum width
		// 	column.eachCell({ includeEmpty: true }, (cell) => {
		// 		const cellValue = cell.value ? cell.value.toString() : '';
		// 		maxLength = Math.max(maxLength, cellValue.length + 2);
		// 	});
		// 	column.width = maxLength;
		// });
		// // Download the file in the browser
		// workbook.xlsx.writeBuffer().then((buffer) => {
		// 	const blob = new Blob([buffer], {
		// 		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		// 	});
		// 	const url = URL.createObjectURL(blob);
		// 	const a = document.createElement('a');
		// 	a.href = url;
		// 	a.download = 'reporte.xlsx';
		// 	a.click();
		// 	URL.revokeObjectURL(url);
		// });
	}
</script>

<svelte:head>
	<title>Renova - Report</title>
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
				Generate Report
			</button>
		</div>
	</div>
	<MainTable />
	<button
		class="mb-4 self-start rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
		onclick={generateExcelReport}
	>
		Generar Reporte
	</button>
</section>
