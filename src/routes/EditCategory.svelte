<script lang="ts">
    import ModalMenu from './ModalMenu.svelte';
    import UnitInputs from './UnitInputs.svelte';

    const { category } = $props<{
        category: IncidenceCategory;
    }>();

    let isMenuOpen = $state(false);
    let concept = $state(category.concept);
    let type = $state(category.type);
    let unit = $state(category.unit);
    let unitMonetaryValue = $state(category.unitMonetaryValue);

    function acceptChanges() {
        isMenuOpen = false;
    }
</script>

<button
    class="ml-1 w-4"
    tabindex="-1"
    onclick={() => (isMenuOpen = true)}
>
    <img class="bg-white" src="/EditIcon.svg" alt="Editar" />
</button>
{#if isMenuOpen}
    <ModalMenu title="Editar Categoría" onAccept={acceptChanges} onCancel={() => (isMenuOpen = false)}>
        <div class="flex flex-col gap-2">
            <input type="hidden" name="id" value={category.id} />
            <label>
                Concepto
                <input class="w-full rounded border px-2 py-1" bind:value={concept} />
            </label>
            <label>
                Tipo
                <select class="w-full rounded border px-2 py-1" bind:value={type}>
                    <option value="destajo">Destajo</option>
                    <option value="bono">Bono</option>
                    <option value="deduccion">Deducción</option>
                </select>
            </label>
            <UnitInputs bind:unit bind:unitMonetaryValue />
            <button formaction="?/deleteCategory" class="bg-red-400">Delete</button>
        </div>
    </ModalMenu>
{/if}