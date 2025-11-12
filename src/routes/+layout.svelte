<script lang="ts">
	import { categoryGroups } from '$lib/constants';
	import { selectedCategoryGroups } from '$lib/stores.svelte';
	import { getCategoryTypeLabel } from '$lib/utils';
	import '../app.css';

	let { children } = $props();
</script>

<div class="fixed top-0 p-2.5 left-0 z-20 flex justify-between w-full">
	<div class="flex gap-2 font-bold text-white">
		{#each categoryGroups as group}
			<label
				class={`${group} flex cursor-pointer items-center gap-1.5 rounded-lg p-2 hover:scale-105`}
			>
				<input
					type="checkbox"
					class="rounded-lg"
					bind:group={selectedCategoryGroups.value}
					value={group}
				/>
				{group === 'resumen' ? 'Resumen' : getCategoryTypeLabel(group)}
			</label>
		{/each}
		<button
			class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-400 px-4 py-2 hover:scale-105"
			onclick={() => {
				selectedCategoryGroups.value = categoryGroups;
			}}
		>
			Todo
		</button>
		<button
			class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-400 px-4 py-2 hover:scale-105"
			onclick={() => {
				selectedCategoryGroups.value = [];
			}}
		>
			Ninguno
		</button>
	</div>
	<div class="flex gap-2">
		<a href="/manage" class="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Manage</a>
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
</div>

<div class="pt-16 text-sm">
	{@render children()}
</div>
