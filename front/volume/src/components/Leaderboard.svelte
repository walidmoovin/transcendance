<script lang="ts">
  import type { Player } from "./Profile.svelte";
  import { onMount } from "svelte";
  import { API_URL } from "../Auth";

  let leaderboard: Array<Player> = [];

  async function getLeader(): Promise<void> {
    let response = await fetch(API_URL + "/leaderboard", {
      credentials: "include",
      mode: "cors",
    });
    leaderboard = await response.json();
  }

  onMount(() => {
    getLeader();
  });
</script>

<div class="overlay">
  <div class="history" on:click|stopPropagation on:keydown|stopPropagation>
    {#if leaderboard.length > 0}
      <table>
        <thead>
          <tr>
            <th colspan="5">Leaderboard</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rank</td>
            <td>Usernames</td>
            <td>Wins</td>
            <td>Matchs</td>
            <td>Winrates</td>
          </tr>
          {#each leaderboard as player}
            <tr>
              <td>{player.rank}</td>
              <td>{player.username}</td>
              <td>{player.wins}</td>
              <td>{player.matchs}</td>
              <td>{player.winrate.toFixed(2)}%</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p>No Players to display</p>
    {/if}
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
    display: flex;
    justify-content: center;
    max-height: 500px;
    overflow-y: scroll;
  }

  td {
    border: 1px solid #333;
    text-align: center;
    max-width: 12ch;
    overflow: hidden;
  }
</style>
