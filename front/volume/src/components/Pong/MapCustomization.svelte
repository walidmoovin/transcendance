<script lang="ts">
  import { onMount } from "svelte";
  import { Point, Rect } from "./utils";
  import type { Map } from "./Map";
  import { DEFAULT_BALL_SIZE, DEFAULT_MAP_SIZE } from "./constants";

  export let map: Map;
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let wallWidth = 20;
  let wallHeight = 80;

  onMount(() => {
    if (canvas) {
      canvas.width = map.size.x;
      canvas.height = map.size.y;
      context = canvas.getContext("2d");
      drawMap();
    }
  });

  $: {
    if (canvas) {
      canvas.width = map.size.x;
      canvas.height = map.size.y;
    }
    drawMap();
  }

  function drawMap() {
    if (canvas && context) {
      context.fillStyle = "black";
      context.fillRect(0, 0, map.size.x, map.size.y);
      for (const wall of map.walls) {
        wall.draw(context, "white");
      }
    }
  }

  function click(e: MouseEvent, rightClick: boolean) {
    if (rightClick) removeWall(e);
    else addWall(e);
    drawMap();
  }

  function addWall(e: MouseEvent) {
    const wall = new Rect(
      new Point(e.offsetX, e.offsetY),
      new Point(wallWidth, wallHeight)
    );
    const ballSpawnArea = new Rect(
      new Point(map.size.x / 2, map.size.y / 2),
      new Point(DEFAULT_BALL_SIZE.x * 5, DEFAULT_BALL_SIZE.y * 5)
    );
    if (map.walls.length < 5 && !wall.collides(ballSpawnArea))
      map.walls.push(wall);
  }

  function removeWall(e: MouseEvent) {
    e.preventDefault();
    const click = new Rect(new Point(e.offsetX, e.offsetY), new Point(1, 1));
    const index = map.walls.findIndex((w) => w.collides(click));
    if (index != -1) map.walls.splice(index, 1);
  }

  function sizeChange() {
    map.walls = [];
  }
</script>

<div>
  <h1>Map Customization:</h1>
  <div>
    Width:
    <input
      type="range"
      min={DEFAULT_MAP_SIZE.x}
      max="1000"
      bind:value={map.size.x}
      on:input={sizeChange}
    />
    Height:
    <input
      type="range"
      min={DEFAULT_MAP_SIZE.y}
      max="800"
      bind:value={map.size.y}
      on:input={sizeChange}
    />
  </div>
  <canvas
    bind:this={canvas}
    on:click={(e) => click(e, false)}
    on:contextmenu={(e) => click(e, true)}
  />
</div>
