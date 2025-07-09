<script>
  import { onMount } from 'svelte';

  let weeks = [];
  let startDate = '';
  let endDate = '';

  async function fetchWeeks() {
    const res = await fetch('/api/weeks');
    weeks = await res.json();
  }

  async function createWeek() {
    await fetch('/api/weeks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    });
    await fetchWeeks();
  }

  onMount(fetchWeeks);
</script>

<div class="p-4">
  <h2 class="text-xl font-bold mb-4">Manage Weeks</h2>

  <div class="flex gap-4 mb-4">
    <input type="date" bind:value={startDate} class="input" />
    <input type="date" bind:value={endDate} class="input" />
    <button on:click={createWeek} class="btn btn-primary">Create Week</button>
  </div>

  <div class="grid grid-cols-1 gap-4">
    {#each weeks as week}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <p>Week: {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}</p>
        </div>
      </div>
    {/each}
  </div>
</div>
