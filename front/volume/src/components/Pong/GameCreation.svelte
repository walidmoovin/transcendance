<script lang="ts">
  import { Map } from "./Map";
  import { DEFAULT_MAP_SIZE, GAME_EVENTS } from "./constants";
  import MapCustomization from "./MapCustomization.svelte";
  import type { GameCreationDto } from "./dtos/GameCreationDto";
  import { store } from "../../Auth";
  import type { Socket } from "socket.io-client";

  export let socket: Socket;
  export let invitedUsername: string;

  let map: Map = new Map(DEFAULT_MAP_SIZE.clone(), []);

  function createGame() {
    const data: GameCreationDto = {
      playerNames: [$store.username, invitedUsername],
      map,
    };
    socket.emit(GAME_EVENTS.CREATE_GAME, data);
  }
</script>

<div class="overlay">
  <div class="window" on:click|stopPropagation on:keydown|stopPropagation>
    Friend:
    <input class="name-input" bind:value={invitedUsername} />
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
    width: 50vw;
  }

  .name-input {
    max-width: 100%;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .window {
      width: 80vw;
    }
  }
</style>
