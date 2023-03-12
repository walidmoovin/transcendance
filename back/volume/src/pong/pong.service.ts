import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UsersService } from 'src/users/users.service'
import Result from './entity/result.entity'
import type User from 'src/users/entity/user.entity'
import { type Player } from './game/Player'

@Injectable()
export class PongService {
  constructor (
    @InjectRepository(Result)
    private readonly resultsRepository: Repository<Result>,
    private readonly usersService: UsersService
  ) {}

  async updateStats (player: User, i: number, result: Result): Promise<void> {
    player.matchs++
    if (result.score[i] > result.score[Math.abs(i - 1)]) player.wins++
    else player.looses++
    player.winrate = (100 * player.wins) / player.matchs
    player.rank = (await this.usersService.getRank(player.ftId)) + 1
  }

  async updatePlayer (i: number, result: Result): Promise<void> {
    const player: User | null = result.players[i]
    if (player == null) return
    if (result.ranked) await this.updateStats(player, i, result)
    player.results.push(result)
    player.status = 'online'
    await this.usersService.save(player)
  }

  async setInGame (playerName: string): Promise<void> {
    const player = await this.usersService.findUserByName(playerName)
    player.status = 'in-game'
    await this.usersService.save(player)
  }

  async saveResult (players: Player[], ranked: boolean): Promise<void> {
    const result = new Result()
    const ply = new Array<User | null>()
    ply.push(await this.usersService.findUserByName(players[0].name))
    ply.push(await this.usersService.findUserByName(players[1].name))
    result.ranked = ranked
    result.players = ply
    result.score = [players[0].score, players[1].score]
    await this.resultsRepository.save(result)
    await this.updatePlayer(0, result)
    await this.updatePlayer(1, result)
  }

  async getRankedHistory (): Promise<Result[]> {
    return await this.resultsRepository.find({
      where: { ranked: true },
      relations: {
        players: true
      },
      order: { date: 'DESC' }
    })
  }

  async getHistoryById (ftId: number): Promise<Result[]> {
    const results = await this.usersService.getResultsById(ftId)
    return results.sort((a, b) => (a.date < b.date ? 1 : -1))
  }
}
