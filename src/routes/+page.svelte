<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import {
		employees,
		categories,
		incidenceCells,
		isReadOnly,
		selectedCategoryTypes,
		selectedWeek
	} from '$lib/stores.svelte';
	import { getCategoryTypeLabel } from '$lib/utils';
	import AddCategory from './AddCategory.svelte';
	import AddEmployee from './AddEmployee.svelte';
	import MainTable from './MainTable.svelte';

	let { data } = $props();
	employees.value = data.employees;
	categories.value = data.categories;
	selectedWeek.value = data.week;
	isReadOnly.value = false;
	incidenceCells.value = data.incidenceCells;

	function getWeekTitle(week: Week | null) {
		if (!week) return '';

		const startDate = new Date(week.startDate);
		const year = startDate.getFullYear();
		const month = startDate.toLocaleString('es-ES', { month: 'long' });
		const endDate = new Date(week.endDate);
		const startDay = startDate.getDate();
		const endDay = endDate.getDate();
		return `Del ${startDay} al ${endDay} de ${month} de ${year}`;
	}

	function getWeekForInput(date: Date | undefined) {
		if (!date) return '';
		const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
		const dayNum = d.getUTCDay() || 7;
		d.setUTCDate(d.getUTCDate() + 4 - dayNum);
		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
		return `${date.getFullYear()}-W${weekNumber}`;
	}
</script>

<div class="fixed top-0 left-0 z-20 flex gap-2 p-2 font-bold text-white">
	<input
		type="week"
		class="text-black"
		value={getWeekForInput(selectedWeek.value?.startDate)}
		onchange={async (e: Event) => {
			const week = (e.target as HTMLInputElement).value;
			const res = await fetch('/api/weeks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ week })
			});
			const { weekId } = await res.json();
			window.location.href = `/?weekId=${weekId}`;
		}}
	/>
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
	<h1 class="text-center text-2xl font-bold">{getWeekTitle(selectedWeek.value)}</h1>
	<MainTable />
</div>

<div class="p-2">
	<AddCategory />
	<AddEmployee />
	<a
		href={`/report?startWeek=${getWeekForInput(selectedWeek.value?.startDate)}&endWeek=${getWeekForInput(selectedWeek.value?.startDate)}`}
		class="mb-4 rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
	>
		Generar Reporte
	</a>
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
