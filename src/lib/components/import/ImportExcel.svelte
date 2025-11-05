<script lang="ts">
	import { selectedWeek } from '$lib/stores.svelte';
	import { invalidateAll } from '$app/navigation';

	let { importType = 'week' }: { importType?: 'week' | 'system' } = $props();

	let fileInput: HTMLInputElement;
	let isUploading = $state(false);

	async function handleFileSelect() {
		const file = fileInput.files?.[0];
		if (!file) return;

		if (!selectedWeek.value) {
			alert('Por favor selecciona una semana antes de importar');
			return;
		}

		isUploading = true;
		
		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('weekId', selectedWeek.value.id.toString());

			const endpoint = importType === 'system' ? '/api/import-excel-system' : '/api/import-excel';
			const response = await fetch(endpoint, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			
			if (result.success) {
				alert(`Excel importado exitosamente!\n\nEstadísticas:\n- Empleados: ${result.stats.totalEmployees}\n- Categorías: ${result.stats.totalCategories}\n- Incidencias: ${result.stats.totalIncidences}\n\nLos datos han sido importados a la semana actual.`);
				
				// Recargar la página para mostrar los datos importados
				await invalidateAll();
			} else {
				alert(`Error: ${result.error}`);
			}
		} catch (error) {
			console.error('Error uploading file:', error);
			alert('Error al procesar el archivo Excel');
		} finally {
			isUploading = false;
			// Limpiar el input
			fileInput.value = '';
		}
	}

	const buttonText = importType === 'system' ? 'Importar del Sistema' : 'Importar Semana';
	const buttonId = `excel-file-input-${importType}`;
</script>

<div class="flex items-center">
	<input
		bind:this={fileInput}
		type="file"
		accept=".xlsx,.xls"
		onchange={handleFileSelect}
		class="hidden"
		id={buttonId}
	/>
	<label
		for={buttonId}
		class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 cursor-pointer {isUploading ? 'opacity-50 cursor-not-allowed' : ''}"
	>
		{isUploading ? 'Procesando...' : buttonText}
	</label>
</div>
