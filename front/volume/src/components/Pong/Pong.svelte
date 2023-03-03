<script lang="ts">
  import { DEFAULT_MAP_SIZE, GAME_EVENTS } from "./constants";
  import type { GameCreationDto } from "./dtos/GameCreationDto";
  import { Game } from "./Game";
  import MapCustomization from "./MapCustomization.svelte";
  import { formatWebsocketData } from "./utils";
  import { Map } from "./Map";
  import { onMount } from "svelte";
  import type { StringDto } from "./dtos/StringDto";

  const FPS = import.meta.env.VITE_FRONT_FPS;
  const SERVER_URL = `ws://${import.meta.env.VITE_HOST}:${
    import.meta.env.VITE_BACK_PORT
  }`;

  let gameCanvas: HTMLCanvasElement;
  let connected: boolean = false;
  let loggedIn: boolean = false;
  let socket: WebSocket;
  let username: string = "John";
  let otherUsername: string = "Garfield";
  let spectateUsername: string = "Garfield";
  let map: Map = new Map(DEFAULT_MAP_SIZE.clone(), []);

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

  function setupSocket(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) {
    socket = new WebSocket(SERVER_URL);
    const game = new Game(canvas, context);
    socket.onmessage = function (e) {
      const event_json = JSON.parse(e.data);
      const event = event_json.event;
      const data = event_json.data;

      if (event == GAME_EVENTS.START_GAME) {
        game.start(socket);
      } else if (event == GAME_EVENTS.GAME_TICK) {
        game.update(data);
      } else if (event == GAME_EVENTS.GET_GAME_INFO) {
        if (data && data.gameId != game.id) {
          game.setInfo(data);
          setInterval(() => {
            game.draw();
          }, 1000 / FPS);
          console.log("Game updated!");
        }
      } else if (event == GAME_EVENTS.REGISTER_PLAYER) {
        console.log("Registered player: " + data.value);
        if (data.value == username) {
          loggedIn = true;
          setInterval(() => {
            updateGameInfo();
          }, 1000);
        }
      } else {
        console.log(
          "Unknown event from server: " + event + " with data " + data
        );
      }
    };
    socket.onopen = () => {
      connected = true;
    };
    socket.onclose = () => {
      connected = false;
      setupSocket(canvas, context);
    };
  }

  function updateGameInfo() {
    socket.send(formatWebsocketData(GAME_EVENTS.GET_GAME_INFO));
  }

  function spectate() {
    const data: StringDto = { value: spectateUsername };
    socket.send(formatWebsocketData(GAME_EVENTS.SPECTATE, data));
  }

  function logIn() {
    const data: StringDto = { value: username };
    socket.send(formatWebsocketData(GAME_EVENTS.REGISTER_PLAYER, data));
  }

  function createGame() {
    const data: GameCreationDto = {
      playerNames: [username, otherUsername],
      map,
    };
    socket.send(formatWebsocketData(GAME_EVENTS.CREATE_GAME, data));
  }
</script>

<div>
  <div>
    {#if connected}
      Your name:
      <input bind:value={username} />
      <br />
      <button on:click={logIn}> Log in </button>
      <br />
      Other player name:
      <input bind:value={otherUsername} disabled={!loggedIn} />
      <br />
      <button on:click={createGame} disabled={!loggedIn}>
        Create game vs {otherUsername}
      </button>
      <br />
      <button
        on:click={() => socket.send(formatWebsocketData(GAME_EVENTS.READY))}
        disabled={!loggedIn}>Ready</button
      >
      <br />
      <input bind:value={spectateUsername} disabled={!loggedIn} />
      <button on:click={spectate} disabled={!loggedIn}
        >Spectate {spectateUsername}</button
      >
      <br />
    {:else}
      Connecting to game server...
    {/if}
    <canvas bind:this={gameCanvas} />
  </div>
  <MapCustomization {map} />
</div>
