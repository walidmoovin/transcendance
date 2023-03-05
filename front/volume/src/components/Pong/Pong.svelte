<script lang="ts">
  import { GAME_EVENTS } from "./constants";
  import { Game } from "./Game";
  import { formatWebsocketData } from "./utils";
  import GameCreation from "./GameCreation.svelte";
  import GameComponent from "./GameComponent.svelte";
  import type { StringDto } from "./dtos/StringDto";
  import SpectateFriend from "./SpectateFriend.svelte";
  import Matchmaking from "./Matchmaking.svelte";
  import type { MatchmakingDto } from "./dtos/MatchmakingDto";
  import { store } from '../../Auth'

  const SERVER_URL = `ws://${import.meta.env.VITE_HOST}:${
    import.meta.env.VITE_BACK_PORT
  }`;

  let createMatchWindow: boolean = false;
  let spectateWindow: boolean = false;
  let gamePlaying: boolean = false;
  let matchmaking: boolean = false;
  let gameCanvas: HTMLCanvasElement;
  let connected: boolean = false;
  let loggedIn: boolean = false;
  let socket: WebSocket;
  let username: string = $store.username;

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
          if (data.yourPaddleIndex !== -2) {
            gamePlaying = true;
            game.setInfo(data);
          } else gamePlaying = false;
        }
      } else if (event == GAME_EVENTS.REGISTER_PLAYER) {
        if (data.value == username) {
          loggedIn = true;
          setInterval(() => {
            updateGameInfo();
          }, 1000);
        }
      } else if (event == GAME_EVENTS.CREATE_GAME) {
        if (data) gamePlaying = true;
      } else if (event == GAME_EVENTS.MATCHMAKING) {
        matchmaking = data.matchmaking;
      } else if (event == GAME_EVENTS.SPECTATE) {
        if (data) {
          gamePlaying = true;
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

  function logIn() {
    const data: StringDto = { value: username };
    socket.send(formatWebsocketData(GAME_EVENTS.REGISTER_PLAYER, data));
  }

  function startMatchmaking() {
    const data: MatchmakingDto = { matchmaking: true };
    socket.send(formatWebsocketData(GAME_EVENTS.MATCHMAKING, data));
  }

  function stopMatchmaking() {
    const data: MatchmakingDto = { matchmaking: false };
    socket.send(formatWebsocketData(GAME_EVENTS.MATCHMAKING, data));
  }
</script>

<div>
  {#if !loggedIn}
    Log in:
    <input bind:value={username} />
    <button on:click={logIn} disabled={!connected}> Log in </button>
    <br />
  {/if}
  <div hidden={!loggedIn}>
    <main>
      <GameComponent {gameCanvas} {gamePlaying} {setupSocket} {socket} />
      {#if gamePlaying}
        <div />
      {:else if connected}
        <h1>Choose a gamemode</h1>
        <button on:click={startMatchmaking}>Matchmaking</button>
        <button on:click={() => (createMatchWindow = true)}
          >Play with a friend</button
        >
        <button on:click={() => (spectateWindow = true)}
          >Spectate a friend</button
        >

        {#if matchmaking}
          <div on:click={stopMatchmaking} on:keydown={stopMatchmaking}>
            <Matchmaking {stopMatchmaking} />
          </div>
        {:else if createMatchWindow}
          <div
            on:click={() => (createMatchWindow = false)}
            on:keydown={() => (createMatchWindow = false)}
          >
            <GameCreation {socket} {username} />
          </div>
        {:else if spectateWindow}
          <div
            on:click={() => (spectateWindow = false)}
            on:keydown={() => (spectateWindow = false)}
          >
            <SpectateFriend {socket} />
          </div>
        {/if}
      {:else}
        Connecting to game server...
      {/if}
    </main>
  </div>
</div>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h1 {
    margin-bottom: 2rem;
  }

  button {
    font-size: 1.5rem;
    padding: 1rem 2rem;
    margin-bottom: 1rem;
  }
</style>
