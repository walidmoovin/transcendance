<script lang="ts">
  import { onMount } from "svelte";
  import { GAME_EVENTS } from "./constants";
  import { formatWebsocketData } from "./utils";

  export let gamePlaying: boolean;
  export let setupSocket: (
    renderCanvas: HTMLCanvasElement,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) => void;
  export let socket: WebSocket;

  let gameCanvas: HTMLCanvasElement;
  let renderCanvas: HTMLCanvasElement;

  //Get canvas and its context
  onMount(() => {
    if (gameCanvas && renderCanvas) {
      const context: CanvasRenderingContext2D = gameCanvas.getContext("2d");
      if (context) {
        setupSocket(renderCanvas, gameCanvas, context);
      }
    }
  });
</script>

<div hidden={!gamePlaying} class="gameDiv">
  <button on:click={() => socket.send(formatWebsocketData(GAME_EVENTS.READY))}
    >Ready</button
  >
  <canvas hidden bind:this={gameCanvas} />
  <canvas bind:this={renderCanvas} class="renderCanvas" />
</div>

<style>
  .gameDiv {
    width: 100%;
    height: 100%;
  }

  .renderCanvas {
    width: 100%;
    height: auto;
    touch-action: none;
  }
</style>
