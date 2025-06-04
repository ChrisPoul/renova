<script lang="ts">
	import ModalMenu from './ModalMenu.svelte';

	let name = $state('');
	let salary = $state(0);
	let puesto = $state('');
	let area = $state('');

  async function addEmployee() {
    await fetch('/api/employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        salary,
        puesto,
        area
      })
    });
    location.reload();
  }
</script>

<ModalMenu title="Agregar Empleado" onAccept={addEmployee} onCancel={() => {}}>
	<div class="flex flex-col gap-2">
		<label>
			Nombre:
			<input type="text" bind:value={name} class="rounded border p-1" />
		</label>
		<label>
			Sueldo:
			<input type="number" bind:value={salary} class="rounded border p-1" />
		</label>
		<label>
			Puesto:
			<input type="text" bind:value={puesto} class="rounded border p-1" />
		</label>
		<label>
			Área:
			<input type="text" bind:value={area} class="rounded border p-1" />
		</label>
	</div>
	{#snippet triggerButton()}
		<span class="rounded bg-gray-400 px-4 py-2 text-white hover:bg-green-600">
			Agregar Empleado
		</span>
	{/snippet}
</ModalMenu>
