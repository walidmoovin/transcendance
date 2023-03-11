<script lang="ts">
  import { formatWebsocketData } from "./utils";
  import { Map } from "./Map";
  import { DEFAULT_MAP_SIZE, GAME_EVENTS } from "./constants";
  import MapCustomization from "./MapCustomization.svelte";
  import type { GameCreationDto } from "./dtos/GameCreationDto";
  import { store } from "../../Auth";

  export let socket: WebSocket;
  export let invitedUsername: string;

  let map: Map = new Map(DEFAULT_MAP_SIZE.clone(), []);

  function createGame() {
    const data: GameCreationDto = {
      playerNames: [$store.username, invitedUsername],
      map,
    };
    socket.send(formatWebsocketData(GAME_EVENTS.CREATE_GAME, data));
  }
</script>

<div class="overlay">
  <div class="window" on:click|stopPropagation on:keydown|stopPropagation>
    Friend:
    <input bind:value={invitedUsername} />
    <button on:click={createGame}>
      Create game vs {invitedUsername}
    </button>
    <MapCustomization {map} />
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

  .window {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1rem;
    width: 80vw;
    height: 80vh;
  }
</style>
