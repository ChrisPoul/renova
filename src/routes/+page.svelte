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
	import ImportExcel from '$lib/components/import/ImportExcel.svelte';

	let { data } = $props();
	
	// Update stores when data changes (for invalidateAll to work)
	$effect(() => {
		employees.value = data.employees;
		categories.value = data.categories;
		selectedWeek.value = data.week;
		isReadOnly.value = false;
		incidenceCells.value = data.incidenceCells;
	});

	function getWeekTitle(week: Week | null) {
		if (!week) return '';

		const startDate = new Date(week.startDate);
		const endDate = new Date(week.endDate);

		const startDay = startDate.getUTCDate();
		const endDay = endDate.getUTCDate();

		const startMonth = startDate.toLocaleString('es-ES', { month: 'long', timeZone: 'UTC' });
		const endMonth = endDate.toLocaleString('es-ES', { month: 'long', timeZone: 'UTC' });

		const startYear = startDate.getUTCFullYear();
		const endYear = endDate.getUTCFullYear();

		if (startMonth === endMonth && startYear === endYear) {
			return `Del ${startDay} al ${endDay} de ${startMonth} de ${startYear}`;
		} else if (startYear === endYear) {
			return `Del ${startDay} de ${startMonth} al ${endDay} de ${endMonth} de ${startYear}`;
		} else {
			return `Del ${startDay} de ${startMonth} de ${startYear} al ${endDay} de ${endMonth} de ${endYear}`;
		}
	}

	async function handleCopy() {
		if (!selectedWeek.value) return;

		if (confirm('¿Está seguro de que desea copiar los datos de la semana anterior? Esta acción sobreescribirá los datos de la semana actual.')) {
			const weekId = selectedWeek.value!.id;
			const res = await fetch('/api/weeks/copy-prev-week', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ weekId })
			});

			const { success, message } = await res.json();

			if (success) {
				window.location.reload();
			} else {
				alert(message);
			}
		}
	}
</script>

<div>
	<div class="flex items-center justify-between px-4">
		<div class="flex items-center gap-3">
			<input
				type="date"
				class="text-black"
				value={selectedWeek.value
					? new Date(selectedWeek.value.startDate).toISOString().split('T')[0]
					: ''}
				onchange={async (e: Event) => {
					const date = (e.target as HTMLInputElement).value;
					const res = await fetch('/api/weeks', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ date })
					});
					const { weekId } = await res.json();
					window.location.href = `/?weekId=${weekId}`;
				}}
			/>
			<h1 class="text-center text-2xl font-bold">{getWeekTitle(selectedWeek.value)}</h1>
		</div>
		<a
			href={selectedWeek.value
				? `/report?startDate=${new Date(selectedWeek.value.startDate).toISOString().split('T')[0]}&endDate=${new Date(selectedWeek.value.endDate).toISOString().split('T')[0]}`
				: '/report'}
			class="rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
		>
			Generar Reporte
		</a>
	</div>
	<MainTable />
</div>


<div class="p-2.5 space-y-3">
<div class="flex justify-between">
	<div class="flex gap-2">
		<AddCategories />
		<AddEmployees />
	</div>

	<div class="flex gap-2">
		<RegisterCategory />
		<RegisterEmployee weekId={selectedWeek.value?.id} />
		<ImportExcel />
	</div>
</div>
	<button
			onclick={handleCopy}
			class="rounded-lg bg-yellow-500 px-3 py-2 text-white font-semibold hover:bg-yellow-600 transition-colors"
		>
			Copiar Semana Anterior
		</button>
</div>
