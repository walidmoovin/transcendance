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
import { Games } from './game/Games'
import { formatWebsocketData } from './game/utils'
import { GAME_EVENTS } from './game/constants'
import { GameCreationDtoValidated } from './dtos/GameCreationDtoValidated'
import { UsePipes, ValidationPipe } from '@nestjs/common'
import { type Game } from './game/Game'
import { plainToClass } from 'class-transformer'
import { PointDtoValidated } from './dtos/PointDtoValidated'
import { StringDtoValidated } from './dtos/StringDtoValidated'

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

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage(GAME_EVENTS.REGISTER_PLAYER)
  registerPlayer (
    @ConnectedSocket()
      client: WebSocketWithId,
      @MessageBody() playerName: StringDtoValidated
  ): { event: string, data: StringDtoValidated } {
    this.socketToPlayerName.set(client, playerName.value)
    return { event: GAME_EVENTS.REGISTER_PLAYER, data: playerName }
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

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage(GAME_EVENTS.PLAYER_MOVE)
  movePlayer (
    @ConnectedSocket()
      client: WebSocketWithId,
      @MessageBody() position: PointDtoValidated
  ): void {
    const realPosition: PointDtoValidated = plainToClass(
      PointDtoValidated,
      position
    )
    const name: string | undefined = this.socketToPlayerName.get(client)
    this.games.movePlayer(name, realPosition)
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage(GAME_EVENTS.CREATE_GAME)
  createGame (
    @ConnectedSocket()
      client: WebSocketWithId,
      @MessageBody() gameCreationDto: GameCreationDtoValidated
  ): void {
    const realGameCreationDto: GameCreationDtoValidated = plainToClass(
      GameCreationDtoValidated,
      gameCreationDto
    )

    if (this.socketToPlayerName.size >= 2) {
      const player1Socket: WebSocketWithId | undefined = Array.from(
        this.socketToPlayerName.keys()
      ).find(
        (key) =>
          this.socketToPlayerName.get(key) ===
          realGameCreationDto.playerNames[0]
      )
      const player2Socket: WebSocketWithId | undefined = Array.from(
        this.socketToPlayerName.keys()
      ).find(
        (key) =>
          this.socketToPlayerName.get(key) ===
          realGameCreationDto.playerNames[1]
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
          realGameCreationDto
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

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage(GAME_EVENTS.SPECTATE)
  spectate (
    @ConnectedSocket()
      client: WebSocketWithId,
      @MessageBody() playerToSpectate: StringDtoValidated
  ): void {
    const name: string | undefined = this.socketToPlayerName.get(client)
    if (name !== undefined) {
      this.games.spectateGame(playerToSpectate.value, client, client.id, name)
    }
  }
}
