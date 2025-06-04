<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		triggerButton,
		title,
		onAccept = () => {},
		onCancel = () => {}
	}: {
		children: Snippet;
		triggerButton: Snippet;
		title: string;
		onAccept?: () => void;
		onCancel?: () => void;
	} = $props();

	let isMenuOpen = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
	function cancel() {
		onCancel();
		toggleMenu();
	}
	function accept() {
		onAccept();
		toggleMenu();
	}
</script>

<button onclick={toggleMenu} tabindex="-1">
	{@render triggerButton()}
</button>
{#if isMenuOpen}
	<button aria-label="Close Menu" onclick={toggleMenu} class="fixed inset-0 z-40 bg-black/50"
	></button>
	<div class="fixed top-1/2 left-1/2 z-50 -translate-1/2">
		<div class="relative w-full max-w-md rounded-lg bg-white px-6 py-4 shadow-xl">
			<button
				class="absolute top-0.5 right-2 text-gray-500 hover:text-gray-700"
				onclick={cancel}
				aria-label="Close"
			>
				&times;
			</button>
			<h2 class="mb-4 text-lg font-semibold">{title}</h2>
			{@render children()}
			<div class="flex justify-end gap-2 pt-4">
				<button
					class="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
					onclick={cancel}
				>
					Cancelar
				</button>
				<button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onclick={accept}>
					Aceptar
				</button>
			</div>
		</div>
	</div>
{/if}
