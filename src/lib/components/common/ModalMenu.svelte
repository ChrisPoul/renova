<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		triggerButton,
		title,
		onAccept = () => {},
		onCancel = () => {},
		isMenuOpen = $bindable(false)
	}: {
		children: Snippet;
		triggerButton: Snippet;
		title: string;
		onAccept?: () => void;
		onCancel?: () => void;
		isMenuOpen?: boolean;
	} = $props();

	let modalRef = $state<HTMLDivElement>();
	let triggerRef: HTMLButtonElement;

	$effect(() => {
		if (isMenuOpen) {
			modalRef!.focus();
		} else {
			triggerRef.focus();
		}
	});

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

<button class="min-w-4" onclick={toggleMenu} tabindex="-1" bind:this={triggerRef}>
	{@render triggerButton()}
</button>
{#if isMenuOpen}
	<button aria-label="Close Menu" onclick={toggleMenu} class="fixed inset-0 z-40 bg-black/50"
	></button>
	<div
		class="fixed top-1/2 left-1/2 z-50 -translate-1/2"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onkeydown={(e) => {
			if (e.key === 'Enter') accept();
			if (e.key === 'Escape') cancel();
		}}
		bind:this={modalRef}
	>
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
