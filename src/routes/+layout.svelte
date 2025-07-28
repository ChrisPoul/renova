<script lang="ts">
	import { categoryTypes } from '$lib/constants';
	import { selectedCategoryTypes } from '$lib/stores.svelte';
	import { getCategoryTypeLabel } from '$lib/utils';
	import '../app.css';

	let { children } = $props();
</script>

<div class="fixed top-0 p-2.5 left-0 z-20 flex justify-between w-full">
	<div class="flex gap-2 font-bold text-white">
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
	<button
		class="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
		onclick={async () => {
			await fetch('/api/logout', { method: 'POST' });
			location.href = '/login';
		}}
	>
		Cerrar sesión
	</button>
</div>

<div class="pt-16">
	{@render children()}
</div>
