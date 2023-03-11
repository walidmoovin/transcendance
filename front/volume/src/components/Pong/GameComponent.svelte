<script lang="ts">
  import { onMount } from "svelte";
  import { GAME_EVENTS } from "./constants";
  import type { Game } from "./Game";
  import { formatWebsocketData } from "./utils";

  export let gamePlaying: boolean;
  export let setupSocket: (
    renderCanvas: HTMLCanvasElement,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) => void;
  export let socket: WebSocket;
  export let game: Game;

  let gameCanvas: HTMLCanvasElement;
  let renderCanvas: HTMLCanvasElement;

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
  {#if game && !game.ranked}
    <button
      on:click={() => socket.send(formatWebsocketData(GAME_EVENTS.LEAVE_GAME))}
      >Leave</button
    >
    <button
      disabled={game.youAreReady}
      on:click={() => socket.send(formatWebsocketData(GAME_EVENTS.READY))}
      >Ready</button
    >
  {/if}
  <canvas hidden bind:this={gameCanvas} />
  <canvas bind:this={renderCanvas} class="renderCanvas" />
</div>

<style>
  .gameDiv {
    width: 100%;
    height: 100%;
  }

  .renderCanvas {
    max-width: 1000px;
    width: 100%;
    height: auto;
    padding-left: 0;
    padding-right: 0;
    margin-left: auto;
    margin-right: auto;
    display: block;
    touch-action: none;
  }
</style>
