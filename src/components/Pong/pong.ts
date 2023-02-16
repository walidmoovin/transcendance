import { GAME_EVENTS } from './constants';
import { Game } from './Game';
import { formatWebsocketData, Point } from './utils';

const FPS = 144;

const socket: WebSocket = new WebSocket('ws://localhost:3001');
socket.onopen = () => {
	console.log('Connected to game server!');
	socket.send(formatWebsocketData(GAME_EVENTS.GET_GAME_INFO));
};
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

//Get canvas and its context
window.onload = () => {
	document.getElementById('start_game_button').addEventListener('click', () => {
		socket.send(formatWebsocketData(GAME_EVENTS.START_GAME));
	});
	canvas = document.getElementById('pong_canvas') as HTMLCanvasElement;
	if (canvas) {
		context = canvas.getContext('2d') as CanvasRenderingContext2D;
		if (context) {
			setupGame();
		}
	}
};

function setupGame() {
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
			game.setInfo(data);
			setInterval(() => {
				game.draw();
			}, 1000 / FPS);
			console.log('Game loaded!');
		} else {
			console.log('Received unknown event from server:');
			console.log(event_json);
		}
	};
}
