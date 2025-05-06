<script lang="ts">
	import { parentCategories } from '$lib/constants';
	import { getParentCategoryLabel } from '$lib/utils';
	import AddCategory from './AddCategory.svelte';
	import MainTable from './MainTable.svelte';

	const categoriasIncidencia: CategoriaIncidencia[] = [
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
		}
	];

	let selectedParentCategories = $state(parentCategories);

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
</script>

<div class="flex gap-2 p-2 font-bold text-white">
	{#each parentCategories as category}
		<label
			class={`${category} flex cursor-pointer items-center gap-1.5 rounded-lg p-2 hover:scale-105`}
		>
			<input
				type="checkbox"
				class="rounded-lg"
				bind:group={selectedParentCategories}
				value={category}
			/>
			{getParentCategoryLabel(category)}
		</label>
	{/each}
	<button
		class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-400 px-4 py-2 hover:scale-105"
		onclick={() => {
			selectedParentCategories = parentCategories;
		}}
	>
		Todo
	</button>
	<button
		class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-400 px-4 py-2 hover:scale-105"
		onclick={() => {
			selectedParentCategories = [];
		}}
	>
		Ninguno
	</button>
</div>

<MainTable {employees} {categoriasIncidencia} {selectedParentCategories} />

<AddCategory />
