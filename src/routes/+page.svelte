<script lang="ts">
	import EmployeeRow from './EmployeeRow.svelte';
	import { totals } from '$lib/stores/totals.svelte';
	import { formatMonetaryValue } from '$lib/utils';
	import AddCategory from './AddCategory.svelte';

	let categoriasIncidencia: CategoriaIncidencia[] = [
		{
			id: 1,
			concept: 'Puertas Grandes',
			type: 'percepcion',
			parentCategory: 'destajo',
			unit: '',
			unitMonetaryValue: 12
		},
		{
			id: 2,
			concept: 'Corte Junke',
			type: 'percepcion',
			parentCategory: 'destajo',
			unit: 'kg',
			unitMonetaryValue: 20
		},
		{
			id: 3,
			concept: 'Corte Chapa',
			type: 'percepcion',
			parentCategory: 'destajo',
			unit: 'kg',
			unitMonetaryValue: 15
		},
		{
			id: 4,
			concept: 'Corte Aluminio',
			type: 'percepcion',
			parentCategory: 'destajo',
			unit: 'kg',
			unitMonetaryValue: 10
		},
		{
			id: 5,
			concept: 'Corte Vidrio',
			type: 'percepcion',
			parentCategory: 'destajo',
			unit: 'kg',
			unitMonetaryValue: 5
		},
		{
			id: 6,
			concept: 'Bono Productividad',
			type: 'percepcion',
			parentCategory: 'bono',
			unit: '$',
			unitMonetaryValue: 1
		},
		{
			id: 8,
			concept: 'Tiempo Extra',
			type: 'percepcion',
			parentCategory: 'bono',
			unit: 'horas',
			unitMonetaryValue: 1
		},
		{
			id: 7,
			concept: 'Días de Destajo',
			type: 'deduccion',
			parentCategory: 'deduccion',
			unit: 'días',
			unitMonetaryValue: 1
		},
	];
	let totalMonetaryValue = $derived.by(getTotalMonetaryValueByEmployees);

	let employees = $state([
		{
			id: 1,
			name: 'John Doe de la crem',
			salary: 1000,
			incidencias: [
				{ id: 1, category: 1, amount: 100 },
				{ id: 2, category: 2, amount: 15 },
				{ id: 3, category: 3, amount: 50 },
				{ id: 4, category: 4, amount: 30 },
				{ id: 5, category: 5, amount: 10 },
				{ id: 6, category: 6, amount: 5 },
				{ id: 13, category: 7, amount: 2 },
				{ id: 15, category: 8, amount: 3 }
			]
		},
		{
			id: 2,
			name: 'Jane Smith',
			salary: 1200,
			incidencias: [
				{ id: 7, category: 1, amount: 200 },
				{ id: 8, category: 2, amount: 25 },
				{ id: 9, category: 3, amount: 60 },
				{ id: 10, category: 4, amount: 40 },
				{ id: 11, category: 5, amount: 20 },
				{ id: 12, category: 6, amount: 10 },
				{ id: 14, category: 7, amount: 3 },
				{ id: 16, category: 8, amount: 4 }
			]
		}
	]);

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
</script>

<div class="relative overflow-auto">
	<table class="m-2 border-collapse border border-gray-500">
		<thead>
			<tr class="bg-gray-100">
				<th class="sticky left-0 border border-gray-500 bg-gray-300 px-4 py-2">Empleado</th>
				<th class="border border-gray-500 bg-gray-300 px-4 py-2">Salario</th>
				{#each categoriasIncidencia as category}
					<th class={`border border-gray-700 px-4 py-2 text-nowrap ${category.parentCategory}`}>
						{category.concept}
						{#if category.unitMonetaryValue !== 1}
							<span class="pl-1 text-sm font-normal">
								{formatMonetaryValue(category.unitMonetaryValue)}
							</span>
						{/if}
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
					<td class="border border-gray-500 bg-gray-200 px-4 py-2 text-nowrap">
						{formatMonetaryValue(getCategoryTotalMonetaryValue(category.id))}
					</td>
				{/each}
				<td class="sticky right-0 border border-gray-500 bg-gray-300 px-4 py-2 text-nowrap">
					{formatMonetaryValue(totalMonetaryValue)}
				</td>
			</tr></tbody
		>
	</table>
</div>

<AddCategory />
