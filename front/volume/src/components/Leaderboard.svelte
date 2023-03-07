<script lang="ts" context="module">
  export interface Player {
    username: string;
    wins: number;
    looses: number;
    winrate: number;
    rank: number;
  }
</script>

<script lang="ts">
  export let leaderboard: Array<Player> = [];
</script>

<div class="overlay">
  <div class="history" on:click|stopPropagation on:keydown|stopPropagation>
    <div>
      {#if leaderboard.length > 0}
        <h2>Leaderboard</h2>
        {#each leaderboard.slice(0, 10) as player}
          <li>
            <span>{player.username}</span>
            <span>{player.wins} - {player.looses} - {player.winrate}%wins</span>
            <span> | rank #{player.rank}</span>
          </li>
        {/each}
      {:else}
        <p>No Players to display</p>
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

  .history {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1rem;
    width: 300px;
  }
</style>
