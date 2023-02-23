<script lang="ts">
  import { GAME_EVENTS } from "./constants";
  import { Game } from "./Game";
  import { formatWebsocketData } from "./utils";

  const FPS = 144;
  const SERVER_URL = "ws://localhost:3001";

  let connected: boolean = false;
  let loggedIn: boolean = false;
  let socket: WebSocket;
  let username: string = "John";
  let otherUsername: string = "Garfield";
  let spectateUsername: string = "Garfield";

  //Get canvas and its context
  window.onload = () => {
    const canvas: HTMLCanvasElement = document.getElementById(
      "pong_canvas"
    ) as HTMLCanvasElement;
    if (canvas) {
      const context: CanvasRenderingContext2D = canvas.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      if (context) {
        setupSocket(canvas, context);
      }
    }
  };

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
      } else {
        console.log("Unknown event from server: " + event);
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
    socket.send(
      formatWebsocketData(GAME_EVENTS.SPECTATE, {
        playerToSpectate: spectateUsername,
      })
    );
  }

  function logIn() {
    socket.send(
      formatWebsocketData(GAME_EVENTS.REGISTER_PLAYER, { playerName: username })
    );
    loggedIn = true;
    setInterval(() => {
      updateGameInfo();
    }, 1000);
  }

  function createGame() {
    socket.send(
      formatWebsocketData(GAME_EVENTS.CREATE_GAME, {
        playerNames: [username, otherUsername],
      })
    );
  }
</script>

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
  <canvas id="pong_canvas" />
</div>
