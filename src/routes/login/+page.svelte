<script lang="ts">
    let username = '';
    let password = '';
    let error = '';

    async function login() {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            location.href = '/';
        } else {
            error = 'Usuario o contraseña incorrectos';
        }
    }
</script>

<form on:submit|preventDefault={login} class="max-w-xs mx-auto mt-20 p-6 bg-white rounded shadow">
    <h2 class="mb-4 text-xl font-bold">Iniciar sesión</h2>
    {#if error}
        <div class="mb-2 text-red-600">{error}</div>
    {/if}
    <input class="mb-2 w-full border p-2 rounded" placeholder="Usuario" bind:value={username} />
    <input class="mb-4 w-full border p-2 rounded" type="password" placeholder="Contraseña" bind:value={password} />
    <button class="w-full bg-blue-600 text-white py-2 rounded" type="submit">Entrar</button>
</form>