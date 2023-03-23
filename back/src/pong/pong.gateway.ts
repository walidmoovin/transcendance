import { UsePipes, ValidationPipe } from '@nestjs/common'
import { Socket } from 'socket.io'
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway
} from '@nestjs/websockets'

import { Games } from './game/Games'
import { GAME_EVENTS } from './game/constants'
import { GameCreationDtoValidated } from './dtos/GameCreationDtoValidated'
import { type Game } from './game/Game'
import { plainToClass } from 'class-transformer'
import { PointDtoValidated } from './dtos/PointDtoValidated'
import { StringDtoValidated } from './dtos/StringDtoValidated'
import { MatchmakingQueue } from './game/MatchmakingQueue'
import { MatchmakingDtoValidated } from './dtos/MatchmakingDtoValidated'
import { PongService } from './pong.service'
import { UsersService } from 'src/users/users.service'
import type User from 'src/users/entity/user.entity'

@WebSocketGateway({
  cors: { origin: new RegExp(`^(http|ws)://${process.env.HOST ?? 'localhost'}(:\\d+)?$`) }
})
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor (
    private readonly pongService: PongService,
    private readonly usersService: UsersService
  ) {}

  private readonly games: Games = new Games(this.pongService)
  private readonly socketToPlayerName = new Map<Socket, string>()
  private readonly matchmakingQueue = new MatchmakingQueue(this.games)

  playerIsRegistered (name: string): boolean {
    return Array.from(this.socketToPlayerName.values()).includes(name)
  }

  handleConnection (): void {}

  handleDisconnect (
    @ConnectedSocket()
      client: Socket
  ): void {
    const name: string | undefined = this.socketToPlayerName.get(client)
    const game: Game | undefined = this.games.playerGame(name)
    if (name !== undefined) {
      if (game !== undefined) {
        game.stop(name)
      }
      console.log('Disconnected ', this.socketToPlayerName.get(client))
      this.matchmakingQueue.removePlayer(name)
      this.socketToPlayerName.delete(client)
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage(GAME_EVENTS.REGISTER_PLAYER)
  async registerPlayer (
    @ConnectedSocket()
      client: Socket,
      @MessageBody('playerName') playerName: StringDtoValidated,
      @MessageBody('socketKey') socketKey: StringDtoValidated
  ): Promise<{ event: string, data: boolean }> {
    let succeeded: boolean = false
    let user: User | null = null
    try {
      user = await this.usersService.findUserByName(playerName.value)
    } catch (e) {
      console.log('Failed to register player', playerName.value)
    }

    // Check that socket key is not already registered
    for (const [socket, name] of this.socketToPlayerName) {
      try {
        const _user: User = await this.usersService.findUserByName(name)
        if (_user.socketKey === socketKey.value) {
          console.log('Failed to register player', playerName.value, '(socket key already registered)')
        }
      } catch (e) {
        // User does not exist anymore, unregister it
        console.log('Disconnected player', name)
        this.socketToPlayerName.delete(socket)
        const game: Game | undefined = this.games.playerGame(name)
        if (game !== undefined) {
          game.stop(name)
        }
        this.matchmakingQueue.removePlayer(name)
        this.socketToPlayerName.delete(client)
      }
    }

    if (
      user !== null &&
      user.socketKey === socketKey.value &&
      !this.playerIsRegistered(playerName.value)
    ) {
      this.socketToPlayerName.set(client, playerName.value)
      succeeded = true
      console.log('Registered player', playerName.value)
    } else {
      console.log('Failed to register player', playerName.value)
    }
    return { event: GAME_EVENTS.REGISTER_PLAYER, data: succeeded }
  }

  @SubscribeMessage(GAME_EVENTS.GET_GAME_INFO)
  getPlayerCount (@ConnectedSocket() client: Socket): void {
    const name: string | undefined = this.socketToPlayerName.get(client)
    if (name !== undefined) {
      client.emit(GAME_EVENTS.GET_GAME_INFO, this.games.getGameInfo(name))
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage(GAME_EVENTS.PLAYER_MOVE)
  movePlayer (
    @ConnectedSocket()
      client: Socket,
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
      client: Socket,
      @MessageBody() gameCreationDto: GameCreationDtoValidated
  ): { event: string, data: boolean } {
    const realGameCreationDto: GameCreationDtoValidated = plainToClass(
      GameCreationDtoValidated,
      gameCreationDto
    )

    if (this.socketToPlayerName.size >= 2) {
      const player1Socket: Socket | undefined = Array.from(
        this.socketToPlayerName.keys()
      ).find(
        (key) =>
          this.socketToPlayerName.get(key) ===
          realGameCreationDto.playerNames[0]
      )
      const player1game: Game | undefined = this.games.playerGame(
        realGameCreationDto.playerNames[0]
      )
      const player2Socket: Socket | undefined = Array.from(
        this.socketToPlayerName.keys()
      ).find(
        (key) =>
          this.socketToPlayerName.get(key) ===
          realGameCreationDto.playerNames[1]
      )
      const player2game: Game | undefined = this.games.playerGame(
        realGameCreationDto.playerNames[1]
      )

      if (
        player1Socket !== undefined &&
        player2Socket !== undefined &&
        player1game === undefined &&
        player2game === undefined &&
        (client.id === player1Socket.id || client.id === player2Socket.id) &&
        player1Socket.id !== player2Socket.id
      ) {
        this.matchmakingQueue.removePlayer(realGameCreationDto.playerNames[0])
        this.matchmakingQueue.removePlayer(realGameCreationDto.playerNames[1])

        const ranked = false
        this.games.newGame(
          [player1Socket, player2Socket],
          [player1Socket.id, player2Socket.id],
          realGameCreationDto,
          ranked
        )
        return { event: GAME_EVENTS.CREATE_GAME, data: true }
      }
    }
    return { event: GAME_EVENTS.CREATE_GAME, data: false }
  }

  @SubscribeMessage(GAME_EVENTS.READY)
  ready (
    @ConnectedSocket()
      client: Socket
  ): { event: string, data: boolean } {
    let succeeded: boolean = false
    const name: string | undefined = this.socketToPlayerName.get(client)
    if (name !== undefined) {
      this.games.ready(name)
      succeeded = true
    }
    return { event: GAME_EVENTS.READY, data: succeeded }
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage(GAME_EVENTS.MATCHMAKING)
  updateMatchmaking (
    @ConnectedSocket()
      client: Socket,
      @MessageBody() matchmakingUpdateData: MatchmakingDtoValidated
  ): { event: string, data: MatchmakingDtoValidated } {
    let matchmaking: boolean = false
    const name: string | undefined = this.socketToPlayerName.get(client)
    if (name !== undefined) {
      if (matchmakingUpdateData.matchmaking && !this.games.isInAGame(name)) {
        this.matchmakingQueue.addPlayer(name, client, client.id)
      } else {
        this.matchmakingQueue.removePlayer(name)
      }
      matchmaking = this.matchmakingQueue.isInQueue(name)
    }
    return {
      event: GAME_EVENTS.MATCHMAKING,
      data: { matchmaking }
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage(GAME_EVENTS.LEAVE_GAME)
  leaveGame (
    @ConnectedSocket()
      client: Socket
  ): void {
    const name: string | undefined = this.socketToPlayerName.get(client)
    if (name !== undefined) {
      void this.games.leaveGame(name)
    }
  }
}
