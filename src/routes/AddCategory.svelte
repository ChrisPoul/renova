<script lang="ts">
	let concept = '';
	let type = 'percepcion';
	let parentCategory = 'destajo';
	let unit = 'kg';
	let unitMonetaryValue = '';
</script>

<form class="m-4 rounded border border-gray-300 p-4">
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium" for="concept">Concepto</label>
		<input
			id="concept"
			type="text"
			bind:value={concept}
			class="w-full rounded border border-gray-300 px-2 py-1"
			required
		/>
	</div>
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium" for="type">Tipo</label>
		<select id="type" bind:value={type} class="w-full rounded border border-gray-300 px-2 py-1">
			<option value="percepcion">Percepción</option>
			<option value="deduccion">Deducción</option>
		</select>
	</div>
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium" for="parentCategory">Categoría</label>
		<select
			id="parentCategory"
			bind:value={parentCategory}
			class="w-full rounded border border-gray-300 px-2 py-1"
		>
			<option value="destajo">Destajo</option>
			<option value="bono">Bono</option>
			<option value="deduccion">Deducción</option>
		</select>
	</div>
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium" for="unit">Unidad</label>
		<select id="unit" bind:value={unit} class="w-full rounded border border-gray-300 px-2 py-1">
			<option value="kg">kg</option>
			<option value="días">días</option>
			<option value="horas">horas</option>
			<option value="m²">m²</option>
			<option value="m³">m³</option>
		</select>
	</div>
	<div class="mb-4">
		<label class="mb-1 block text-sm font-medium" for="unitMonetaryValue"
			>Valor Monetario por Unidad</label
		>
		<input
			id="unitMonetaryValue"
			type="number"
			step="0.01"
			bind:value={unitMonetaryValue}
			class="w-full rounded border border-gray-300 px-2 py-1"
			required
		/>
	</div>
	<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
		Agregar Categoría
	</button>
</form>
