import { Inject, Injectable, forwardRef } from '@nestjs/common'
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

  async updatePlayer (i: number, result: Result) {
    const player: User | null = result.players[i]
    if (player == null) return
    player.matchs++
    if (result.score[i] > result.score[Math.abs(i - 1)]) player.wins++
    else player.looses++
    player.winrate = (100 * player.wins) / player.matchs
    player.results.push(result)
    this.usersService.save(player)
  }

  async saveResult (players: Player[]) {
    const result = new Result()
    result.players = await Promise.all(
      players.map(async (p): Promise<User | null> => {
        return await this.usersService.findUserByName(p.name)
      })
    )
    result.score = players.map((p) => p.score)
    this.updatePlayer(0, result)
    this.updatePlayer(1, result)
    this.resultsRepository.save(result)
  }

  async getHistory (): Promise<Result[]> {
    return await this.resultsRepository.find({
      order: { date: 'DESC' }
    })
  }

  async getHistoryById (ftId: number): Promise<Result[]> {
    const results = await this.usersService.getResults(ftId)
    return results.sort((a, b) => (a.date < b.date ? 1 : -1))
  }

}
