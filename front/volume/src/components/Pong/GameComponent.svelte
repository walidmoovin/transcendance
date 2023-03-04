<script lang="ts">
  import { onMount } from "svelte";
  import { GAME_EVENTS } from "./constants";
  import { formatWebsocketData } from "./utils";

  export let gameCanvas: HTMLCanvasElement;
  export let gamePlaying: boolean;
  export let setupSocket: (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) => void;
  export let socket: WebSocket;

  //Get canvas and its context
  onMount(() => {
    if (gameCanvas) {
      const context: CanvasRenderingContext2D = gameCanvas.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      if (context) {
        setupSocket(gameCanvas, context);
      }
    }
  });
</script>

<div hidden={!gamePlaying}>
  <button on:click={() => socket.send(formatWebsocketData(GAME_EVENTS.READY))}
    >Ready</button
  >
  <canvas bind:this={gameCanvas} />
</div>
