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
  import { getUser, store } from "../../Auth";
  import ColorPicker from "./ColorPicker.svelte";
  import { APPSTATE } from "../../App.svelte";

  export function inviteToGame(event: CustomEvent<string>) {
    setAppState(APPSTATE.CREATE_GAME);
    invitedUsername = event.detail;
  }

  export let fakeUser: boolean;
  export let appState: string;
  export let setAppState: (newState: APPSTATE | string) => void;

  const SERVER_URL = `ws://${import.meta.env.VITE_HOST}:${
    import.meta.env.VITE_BACK_PORT
  }`;

  let gamePlaying: boolean = false;
  let connected: boolean = false;
  let loggedIn: boolean = false;
  let failedLogIn: boolean = false;
  let socket: WebSocket;
  let elementsColor: string = "#FFFFFF";
  let backgroundColor: string = "#000000";
  let game: Game;
  let renderCanvas: HTMLCanvasElement;
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let invitedUsername: string = "";

  function setupSocket(
    _renderCanvas: HTMLCanvasElement,
    _canvas: HTMLCanvasElement,
    _context: CanvasRenderingContext2D
  ) {
    socket = new WebSocket(SERVER_URL);
    renderCanvas = _renderCanvas;
    canvas = _canvas;
    context = _context;
    game = new Game(
      _renderCanvas,
      canvas,
      context,
      elementsColor,
      backgroundColor
    );

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
          if (gamePlaying && data.gameId == "") {
            resetMenus();
            gamePlaying = false;
          }
          if (data.yourPaddleIndex !== -2) {
            gamePlaying = true;
            game.setInfo(data);
          }
        }
      } else if (event == GAME_EVENTS.REGISTER_PLAYER) {
        if (data) {
          loggedIn = true;
          setInterval(() => {
            updateGameInfo();
          }, 1000);
        } else {
          failedLogIn = true;
        }
      } else if (event == GAME_EVENTS.CREATE_GAME) {
        if (data) gamePlaying = true;
      } else if (event == GAME_EVENTS.MATCHMAKING) {
        if (data.matchmaking && appState !== APPSTATE.MATCHMAKING) {
          setAppState(APPSTATE.MATCHMAKING);
        } else if (!data.matchmaking && appState === APPSTATE.MATCHMAKING) {
          setAppState(APPSTATE.HOME);
        }
      } else if (event == GAME_EVENTS.SPECTATE) {
        if (data) {
          gamePlaying = true;
        }
      } else if (event == GAME_EVENTS.READY) {
        game.youAreReady = true;
      } else {
        console.log(
          "Unknown event from server: " + event + " with data " + data
        );
      }
    };
    socket.onopen = onSocketOpen;
    socket.onclose = onSocketClose;
  }

  async function onSocketOpen() {
    if (!fakeUser) await getUser();
    void logIn();
    connected = true;
  }

  async function onSocketClose() {
    connected = false;
    setupSocket(renderCanvas, canvas, context);
  }

  function updateGameInfo() {
    socket.send(formatWebsocketData(GAME_EVENTS.GET_GAME_INFO));
  }

  async function logIn() {
    const data: { playerName: StringDto; socketKey: StringDto } = {
      playerName: { value: $store.username },
      socketKey: { value: $store.socketKey },
    };
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

  function resetMenus() {
    setAppState(APPSTATE.HOME);
    game.youAreReady = false;
  }

  $: {
    if (game !== undefined) {
      game.updateColors(elementsColor, backgroundColor);
    }
  }

  $: {
    if (socket && socket.readyState) {
      if (appState === APPSTATE.MATCHMAKING) {
        startMatchmaking();
      } else if (appState !== APPSTATE.MATCHMAKING) {
        stopMatchmaking();
      }
    }
  }
</script>

<main>
  <GameComponent {game} {gamePlaying} {setupSocket} {socket} />
  {#if gamePlaying}
    <div />
  {:else if loggedIn}
    <h1>Choose a gamemode</h1>
    <button on:click={startMatchmaking}>Matchmaking</button>
    <button on:click={() => setAppState(APPSTATE.CREATE_GAME)}
      >Play with a friend</button
    >
    <button on:click={() => setAppState(APPSTATE.SPECTATE_GAME)}
      >Spectate a friend</button
    >
    <label for="colorPicker">Elements color:</label>
    <ColorPicker bind:color={elementsColor} />
    <label for="colorPicker">Background color:</label>
    <ColorPicker bind:color={backgroundColor} />

    {#if appState === APPSTATE.MATCHMAKING}
      <div on:click={stopMatchmaking} on:keydown={stopMatchmaking}>
        <Matchmaking {stopMatchmaking} />
      </div>
    {:else if appState === APPSTATE.CREATE_GAME}
      <div
        on:click={() => setAppState(APPSTATE.HOME)}
        on:keydown={() => setAppState(APPSTATE.HOME)}
      >
        <GameCreation {socket} {invitedUsername} />
      </div>
    {:else if appState === APPSTATE.SPECTATE_GAME}
      <div
        on:click={() => setAppState(APPSTATE.HOME)}
        on:keydown={() => setAppState(APPSTATE.HOME)}
      >
        <SpectateFriend {socket} />
      </div>
    {/if}
  {:else if !connected}
    Connecting to game server...
  {:else if failedLogIn}
    Failed to log in to game server. Do you have multiple pages open at the same
    time? If yes, please close them and try again.
  {:else if !loggedIn}
    Logging in to game server...
  {/if}
</main>

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
