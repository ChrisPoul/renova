<script lang="ts">
	import {
		employees,
		categories,
		incidenceCells,
		isReadOnly,
		selectedWeek
	} from '$lib/stores.svelte';
	import MainTable from '$lib/components/table/MainTable.svelte';
	import RegisterCategory from '$lib/components/categories/RegisterCategory.svelte';
	import RegisterEmployee from '$lib/components/employees/RegisterEmployee.svelte';
	import AddEmployees from '$lib/components/employees/AddEmployees.svelte';
	import AddCategories from '$lib/components/categories/AddCategories.svelte';

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

<div>
	<div class="flex items-center justify-between gap-3 px-4">
		<div class="flex">
			<input
				type="week"
				class=" text-black"
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
			<h1 class="text-center text-2xl font-bold">{getWeekTitle(selectedWeek.value)}</h1>
		</div>
		<a
			href={`/report?startWeek=${getWeekForInput(selectedWeek.value?.startDate)}&endWeek=${getWeekForInput(selectedWeek.value?.startDate)}`}
			class="rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
		>
			Generar Reporte
		</a>
	</div>
	<MainTable />
</div>

<div class="flex justify-between p-2.5">
	<div class="flex gap-2">
		<AddCategories />
		<AddEmployees />
	</div>
	<div class="flex gap-2">
		<RegisterCategory />
		<RegisterEmployee />
	</div>
</div>
