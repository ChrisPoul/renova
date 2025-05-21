<script>
	import { validateAmount } from '$lib/utils';

	let { unit = $bindable(), unitMonetaryValue = $bindable() } = $props();

	const unitOptions = ['u', 'kg', 'días', 'horas', '$', 'm²', 'm³'];
	const disabledUnits = ['días', 'horas', '$'];
</script>

<div>
	<label class="mb-1 block text-sm font-medium" for="unit">Unidad</label>
	<select id="unit" bind:value={unit} class="w-full rounded border border-gray-300 px-2 py-1">
		{#each unitOptions as option}
			<option value={option}>
				{#if option === 'u'}
					u (unidad)
				{:else}
					{option}
				{/if}
			</option>
		{/each}
	</select>
</div>
<div>
	<label class="mb-1 block text-sm font-medium" for="unitMonetaryValue"
		>Valor Monetario por Unidad</label
	>
	<input
		id="unitMonetaryValue"
		type="number"
		step="0.01"
		bind:value={unitMonetaryValue}
		oninput={() => {
			unitMonetaryValue = validateAmount(unitMonetaryValue);
		}}
		class="w-full rounded border border-gray-300 px-2 py-1 disabled:bg-gray-300 disabled:opacity-70"
		required
		disabled={disabledUnits.includes(unit)}
	/>
</div>
