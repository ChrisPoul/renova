<script lang="ts">
    import MainTable from "../MainTable.svelte";
    import { isReadOnly, selectedWeek, totals, selectedCategoryTypes } from "$lib/stores.svelte";
    import ExcelJS from 'exceljs';
    import { formatMonetaryValue, getCategoryTypeLabel } from '$lib/utils';

    let { data } = $props();
    let employees = $state(data.employees);
    let incidenceCategories = $state(data.incidenceCategories);
    selectedWeek.value = data.selectedWeek;
    let totalsByCategoryType = $derived.by(getTotalsByCategoryType);

    isReadOnly.value = true;

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
		const categoryTypeTotals = totals.categoryTypes.get(categoryType);
		if (!categoryTypeTotals) return 0;
		for (const [employeeId, employeeCategoryTypeTotal] of categoryTypeTotals) {
			total += employeeCategoryTypeTotal;
		}
		return total;
	}
	function getCategoryTotalMonetaryValueAndAmount(categoryId: number) {
		let total = {
			monetaryValue: 0,
			amount: 0
		};
		const incidenciaTotalsInCategory = totals.incidences.get(categoryId);
		if (!incidenciaTotalsInCategory) return total;
		for (const [employeeId, incidenciaTotal] of incidenciaTotalsInCategory) {
			total.monetaryValue += incidenciaTotal.monetaryValue;
			total.amount += incidenciaTotal.amount;
		}
		return total;
	}

    function generateExcelReport() {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Reporte');

		const headers = [
			'Empleado',
			'Área',
			'Puesto',
			'Salario',
			...incidenceCategories
				.filter((cat) => selectedCategoryTypes.value.includes(cat.type))
				.map((cat) => cat.concept),
			...selectedCategoryTypes.value.map((type) => `Total ${getCategoryTypeLabel(type)}`),
			'Total'
		];

		const headerRow = worksheet.addRow(headers);

		// Category type colors matching your CSS
		const defaultHeaderColor = 'FFE5E7EB'; // light gray

		let colIdx = 1;
		for (const header of headers) {
			const cat = incidenceCategories.find((c) => c.concept === header);
			let color = defaultHeaderColor;
			if (cat && categoryTypeColors[cat.type]) {
				color = categoryTypeColors[cat.type];
			}
			worksheet.getColumn(colIdx).width = Math.max(header.length + 2, 12);
			const cell = headerRow.getCell(colIdx);
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: color }
			};
			cell.font = { bold: true };
			colIdx++;
		}

		// Find the column indexes for each category type total column
		const totalColIndexes = selectedCategoryTypes.value.map((type) => {
			const header = `Total ${getCategoryTypeLabel(type)}`;
			return headers.indexOf(header) + 1; // exceljs columns are 1-based
		});

		// Color those columns in all rows (including the totals row)
		worksheet.eachRow((row) => {
			totalColIndexes.forEach((colIdx, i) => {
				const cell = row.getCell(colIdx);
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: categoryTypeColors[selectedCategoryTypes.value[i]] }
				};
			});
		});

		// Add data rows
		for (const employee of employees) {
			const row = [
				employee.name,
				employee.area,
				employee.puesto,
				formatMonetaryValue(employee.salary)
			];

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
				const typeTotal = totals.categoryTypes.get(categoryType)?.get(employee.id) ?? 0;
				row.push(formatMonetaryValue(typeTotal));
			}

			const employeeTotal = (() => {
				let total = 0;
				for (const categoryType of selectedCategoryTypes.value) {
					const categoryTypeTotal = totals.categoryTypes.get(categoryType)?.get(employee.id) ?? 0;
					if (categoryType === 'deduccion') {
						total -= categoryTypeTotal;
					} else {
						total += categoryTypeTotal;
					}
				}
				return formatMonetaryValue(total);
			})();
			row.push(employeeTotal);

			worksheet.addRow(row);
		}

		// --- Add totals row at the end ---
		const totalsRow = [
			'Total',
			'', // Área
			'', // Puesto
			formatMonetaryValue(getTotalSalary())
		];

		for (const category of incidenceCategories) {
			if (!selectedCategoryTypes.value.includes(category.type)) continue;
			const { amount, monetaryValue } = getCategoryTotalMonetaryValueAndAmount(category.id);
			totalsRow.push(`${amount} (${formatMonetaryValue(monetaryValue)})`);
		}

		for (const categoryType of selectedCategoryTypes.value) {
			totalsRow.push(formatMonetaryValue(totalsByCategoryType.get(categoryType) ?? 0));
		}

		// Grand total (all)
		totalsRow.push(formatMonetaryValue(totalsByCategoryType.get('all') ?? 0));

		const excelTotalsRow = worksheet.addRow(totalsRow);

		// Color the entire totals row in gray
		excelTotalsRow.eachCell((cell) => {
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FFE5E7EB' } // light gray
			};
		});

		// Optionally, color the "Total" cell
		excelTotalsRow.getCell(1).fill = {
			type: 'pattern',
			pattern: 'solid',
				fgColor: { argb: 'FFE5E7EB' }
		};

		// Auto-size columns based on the max length of their contents
		worksheet.columns.forEach((column) => {
			let maxLength = 10; // minimum width
			column.eachCell({ includeEmpty: true }, (cell) => {
				const cellValue = cell.value ? cell.value.toString() : '';
				maxLength = Math.max(maxLength, cellValue.length + 2);
			});
			column.width = maxLength;
		});

		// Download the file in the browser
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
    <title>Renova - Report</title>
</svelte:head>

<section class="flex flex-col gap-4 p-4">
    <h1 class="text-4xl font-semibold">Report</h1>
    <MainTable {employees} {incidenceCategories} {getCategoryTotalMonetaryValueAndAmount} {getCategoryTypeTotalMonetaryValue} {totalsByCategoryType} />
    <button
		class="mb-4 rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600 self-start"
		onclick={generateExcelReport}
	>
		Generar Reporte
	</button>
</section>
