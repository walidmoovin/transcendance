import { type WebSocket } from 'ws'
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway
} from '@nestjs/websockets'
import { randomUUID } from 'crypto'
import { Games } from './pong'
import { formatWebsocketData, Point } from './game/utils'
import { GAME_EVENTS } from './game/constants'
import { PlayerNamesDto } from './dtos/PlayerNamesDto'
import { UsePipes, ValidationPipe } from '@nestjs/common'
import { type Game } from './game/Game'

interface WebSocketWithId extends WebSocket {
  id: string
}

@WebSocketGateway()
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly games: Games = new Games()
  private readonly socketToPlayerName = new Map<WebSocketWithId, string>()

  handleConnection (client: WebSocketWithId): void {
    const uuid = randomUUID()
    client.id = uuid
  }

  handleDisconnect (
    @ConnectedSocket()
      client: WebSocketWithId
  ): void {
    const name: string | undefined = this.socketToPlayerName.get(client)
    const game: Game | null = this.games.playerGame(name)
    if (game !== null) {
      console.log('Disconnected ', this.socketToPlayerName.get(client))
      if (game.isPlaying()) {
        game.stop()
      }
      this.socketToPlayerName.delete(client)
    }
  }

  @SubscribeMessage(GAME_EVENTS.REGISTER_PLAYER)
  registerPlayer (
    @ConnectedSocket()
      client: WebSocketWithId,
      @MessageBody('playerName') playerName: string
  ): void {
    this.socketToPlayerName.set(client, playerName)
    console.log('Connected ', this.socketToPlayerName.get(client))
  }

  @SubscribeMessage(GAME_EVENTS.GET_GAME_INFO)
  getPlayerCount (@ConnectedSocket() client: WebSocketWithId): void {
    const name: string | undefined = this.socketToPlayerName.get(client)
    if (name !== undefined) {
      client.send(
        formatWebsocketData(
          GAME_EVENTS.GET_GAME_INFO,
          this.games.getGameInfo(name)
        )
      )
    }
  }

  @SubscribeMessage(GAME_EVENTS.PLAYER_MOVE)
  movePlayer (
    @ConnectedSocket()
      client: WebSocketWithId,
      @MessageBody('position') position: Point
  ): void {
    const name: string | undefined = this.socketToPlayerName.get(client)
    this.games.movePlayer(name, position)
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage(GAME_EVENTS.CREATE_GAME)
  createGame (
    @ConnectedSocket()
      client: WebSocketWithId,
      @MessageBody() playerNamesDto: PlayerNamesDto
  ): void {
    if (this.socketToPlayerName.size >= 2) {
      const player1Socket: WebSocketWithId | undefined = Array.from(
        this.socketToPlayerName.keys()
      ).find(
        (key) =>
          this.socketToPlayerName.get(key) === playerNamesDto.playerNames[0]
      )
      const player2Socket: WebSocketWithId | undefined = Array.from(
        this.socketToPlayerName.keys()
      ).find(
        (key) =>
          this.socketToPlayerName.get(key) === playerNamesDto.playerNames[1]
      )

      if (
        player1Socket !== undefined &&
        player2Socket !== undefined &&
        (client.id === player1Socket.id || client.id === player2Socket.id) &&
        player1Socket.id !== player2Socket.id
      ) {
        this.games.newGame(
          [player1Socket, player2Socket],
          [player1Socket.id, player2Socket.id],
          playerNamesDto.playerNames
        )
      }
    }
  }

  @SubscribeMessage(GAME_EVENTS.READY)
  ready (
    @ConnectedSocket()
      client: WebSocketWithId
  ): void {
    const name: string | undefined = this.socketToPlayerName.get(client)
    if (name !== undefined) {
      this.games.ready(name)
    }
  }

  @SubscribeMessage(GAME_EVENTS.SPECTATE)
  spectate (
    @ConnectedSocket()
      client: WebSocketWithId,
      @MessageBody('playerToSpectate') playerToSpectate: string
  ): void {
    const name: string | undefined = this.socketToPlayerName.get(client)
    if (name !== undefined) {
      this.games.spectateGame(playerToSpectate, client, client.id, name)
    }
  }
}
