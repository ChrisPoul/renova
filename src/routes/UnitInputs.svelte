<script>
	import { validateAmount } from '$lib/utils';

	let {
		unit = $bindable(),
		unitMonetaryValue = $bindable(),
		unitValueIsDerived = $bindable()
	} = $props();

	const unitOptions = ['piezas', 'kg', 'días', 'horas', '$', 'm²', 'm³', 'u'];
	const derivableUnits = ['días', 'horas'];

	$effect(() => {
		if (unitValueIsDerived) {
			unitMonetaryValue = 'Derivado del Salario';
		} else if (unitMonetaryValue === 'Derivado del Salario') {
			unitMonetaryValue = 1;
		}
	});
	$effect(() => {
		if (unit === '$') {
			unitMonetaryValue = 1;
		}
	});
</script>

<div>
	<label class="mb-1 block text-left text-sm font-medium" for="unit">Unidad</label>
	<select name="unit" bind:value={unit} class="w-full rounded border border-gray-300 px-2 py-1">
		{#each unitOptions as option}
			<option value={option}>
				{#if option === 'u'}
					u (unidades)
				{:else}
					{option}
				{/if}
			</option>
		{/each}
	</select>
</div>
{#if derivableUnits.includes(unit)}
	<div class="flex items-center gap-1">
		<label class="mb-1 block text-left text-sm font-medium" for="unitValueIsDerived"
			>Derivar Valor de Unidad</label
		>
		<input
			name="unitValueIsDerived"
			type="checkbox"
			bind:checked={unitValueIsDerived}
			class="rounded border border-gray-300 px-2 py-1"
		/>
	</div>
{/if}
<div>
	<label class="mb-1 block text-left text-sm font-medium" for="unitMonetaryValue"
		>Valor Monetario por Unidad</label
	>
	<input
		name="unitMonetaryValue"
		type={unitValueIsDerived ? 'text' : 'number'}
		step="0.01"
		bind:value={unitMonetaryValue}
		oninput={() => {
			unitMonetaryValue = validateAmount(unitMonetaryValue);
		}}
		class="w-full rounded border border-gray-300 px-2 py-1 disabled:bg-gray-300 disabled:opacity-70"
		required
		disabled={unitValueIsDerived || unit === '$'}
	/>
</div>
