<script lang="ts" context="module">
  import type Player from "./Profile.svelte";
  export interface Match {
    players: Array<Player>;
    score: Array<number>;
    date: string;
    ranked: boolean;
  }
  import { API_URL } from "../Auth";
</script>

<script lang="ts">
  import InfiniteScroll from "./infiniteScroll.svelte";
  import { onMount } from "svelte";

  export let username: string = "Global";
  function formatDate(str: string) {
    const splitT = str.split("T");
    const splitDate = splitT[0].split("-");
    const splitDot = splitT[1].split(".");
    return `${splitDate[1]}/${splitDate[2]}-${splitDot[0]}`;
  }
  let page: number = 1;
  let data: Array<Match> = [];
  let newBatch: Array<Match> = [];

  async function fetchData() {
    let response: Response;
    if (username === "Global") {
      response = await fetch(`${API_URL}/results/global?page=${page}`, {
        credentials: "include",
        mode: "cors",
      });
    } else {
      response = await fetch(`${API_URL}/users/${username}/byname`);
      if (response.ok) {
        let user = await response.json();
        response = await fetch(`${API_URL}/results/${user.ftId}?page=${page}`, {
          credentials: "include",
          mode: "cors",
        });
      }
    }
    let tmp = await response.json();
    newBatch = tmp.data.map((match: Match) => {
      return {
        players: match.players,
        score: match.score,
        date: 
          new Date(match.date).toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
            dateStyle: "short",
            timeStyle: "short",
          }),
        ranked: match.ranked,
      };
    });
    page++;
  }

  onMount(() => {
    fetchData();
  });

  $: data = [...data, ...newBatch];
</script>

<div class="overlay">
  <div class="history" on:click|stopPropagation on:keydown|stopPropagation>
    <div>
      {#if data.length > 0}
        <table>
          <thead>
            <tr>
              <th colspan="3">{username}'s last matchs</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Date</td>
              <td>Players</td>
              <td>Scores</td>
            </tr>
            {#each data as match}
              <tr>
                <td>{match.date}</td>
                {#if match?.players[0]?.username && match?.players[1]?.username}
                  <td
                    >{match.players[0].username}<br />{match.players[1]
                      .username}</td
                  >
                  <td>{match.score[0]}<br />{match.score[1]}</td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No matches to display</p>
      {/if}
    </div>
    <InfiniteScroll
      hasMore={newBatch.length > 0}
      threshold={10}
      on:loadMore={fetchData}
    />
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
    border: 1px solid #111;
    text-align: center;
    max-width: 15ch;
    overflow: hidden;
  }
</style>
