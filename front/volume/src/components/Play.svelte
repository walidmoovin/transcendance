<script lang="ts">
  let creatingMatch: boolean = false;
</script>

<main>
  <h1>Choose a gamemode</h1>
  <button>Matchmaking</button>
  <button on:click={() => creatingMatch}>Play with a friend</button>

  {#if creatingMatch}
    <CreateMatch />
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h1 {
    margin-bottom: 2rem;
  }

  button {
    font-size: 1.5rem;
    padding: 1rem 2rem;
    margin-bottom: 1rem;
  }
</style>
