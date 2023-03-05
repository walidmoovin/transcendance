import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm'
import { UsersService } from 'src/users/users.service'
import Result from './entity/result.entity'
import User from 'src/users/entity/user.entity'
import { Player } from './game/Player'


@Injectable()
export class PongService {
  constructor(
    @InjectRepository(Result)private readonly resultsRepository: Repository<Result>,
    private readonly usersService: UsersService
  ) { }

  async saveResult(players: Player[]) {
    let result = new Result;
    result.players = await Promise.all(players.map(async (p): Promise<User> => {
      return await this.usersService.findUserByName(p.name)
    }))
    result.score = players.map((p) => p.score);
    result.players.forEach((p) => p.matchs++)
    if (result.score[0] > result.score[1]) {
      result.players[0].wins++;
      result.players[1].looses++;
    }
    else if (result.score[1] > result.score[0]) {
      result.players[1].wins++
      result.players[0].looses++
    }
    result.players[0].results.push(result)
    result.players[1].results.push(result)
    this.resultsRepository.save(result)
    this.usersService.save(result.players[0],)
    this.usersService.save(result.players[1])
  }
}
