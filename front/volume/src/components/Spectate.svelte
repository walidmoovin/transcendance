<script lang="ts" context="module">
  export interface SpectateType {
    id: string;
    player1: string;
    player2: string;
  }
</script>

<script lang="ts">
  export let spectate: Array<SpectateType> = [];
  export let watch = (id: string) => {};
</script>

<div class="overlay">
  <div class="spectate" on:click|stopPropagation on:keydown|stopPropagation>
    <div>
      {#if spectate.length > 0}
        <h2>Monkey spectating</h2>
        {#each spectate.slice(0, 10) as _spectate}
          <li>
            <span>{_spectate.player1} VS {_spectate.player2}</span>
            <button on:click={() => watch(_spectate.id)}>Spectate</button>
          </li>
        {/each}
      {:else}
        <p>No matches to spectate</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .spectate {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1rem;
    width: 300px;
  }
</style>
