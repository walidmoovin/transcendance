<script lang="ts">
  import { formatWebsocketData } from "./utils";
  import { GAME_EVENTS } from "./constants";
  import type { StringDto } from "./dtos/StringDto";

  export let socket: WebSocket;

  let spectateUsername: string = "Garfield";

  function spectate() {
    const data: StringDto = { value: spectateUsername };
    socket.send(formatWebsocketData(GAME_EVENTS.SPECTATE, data));
  }
</script>

<div class="overlay">
  <div class="window" on:click|stopPropagation on:keydown|stopPropagation>
    <input bind:value={spectateUsername} />
    <button on:click={spectate}>Spectate</button>
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
    width: 400px;
  }
</style>
