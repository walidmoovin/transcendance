<script lang="ts">
	import { GAME_EVENTS } from './constants';
	import { Game } from './Game';
	import { formatWebsocketData } from './utils';

	const FPS = 144;
	const SERVER_URL = 'ws://localhost:3001';

	let connected: boolean = false;
	let socket: WebSocket;
	let username: string = 'John';
	let otherUsername: string = 'Garfield';

	//Get canvas and its context
	window.onload = () => {
		const canvas: HTMLCanvasElement = document.getElementById('pong_canvas') as HTMLCanvasElement;
		if (canvas) {
			const context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
			if (context) {
				setupSocket(canvas, context);
			}
		}
	};

	function setupSocket(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
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
					console.log('Game updated!');
				}
			} else {
				console.log('Unknown event from server: ' + event);
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

	function connectToServer() {
		socket.send(formatWebsocketData(GAME_EVENTS.REGISTER_PLAYER, { playerName: username }));
		setInterval(() => {
			updateGameInfo();
		}, 1000);
	}
</script>

<div>
	{#if connected}
		Your name:
		<input bind:value={username} />
		<br />
		<button on:click={connectToServer}> Connect </button>
		<br />
		Other player name:
		<input bind:value={otherUsername} />
		<br />
		<button
			on:click={() => {
				socket.send(formatWebsocketData(GAME_EVENTS.CREATE_GAME, { playerNames: [username, otherUsername] }));
				updateGameInfo();
			}}
		>
			Create game vs {otherUsername}
		</button>
		<br />
		<button on:click={() => socket.send(formatWebsocketData(GAME_EVENTS.READY))}>Ready</button>
		<br />
		<br />
	{:else}
		Connecting to game server...
	{/if}
	<canvas id="pong_canvas" />
</div>
