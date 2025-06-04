<script lang="ts">
	import ModalMenu from './ModalMenu.svelte';

	let name = $state('');
	let salary = $state(0);
	let puesto = $state('');
	let area = $state('');
</script>

<button class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600" type="button">
	Agregar Empleado
</button>
