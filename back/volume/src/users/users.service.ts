import { Catch, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm'
import { User } from './entity/user.entity'
import { type UserDto } from './dto/user.dto'
import { type Channel } from 'src/chat/entity/channel.entity'
import type Result from 'src/pong/entity/result.entity'
import { Cron } from '@nestjs/schedule'

@Injectable()
@Catch(QueryFailedError, EntityNotFoundError)
export class UsersService {
  constructor (
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) {}

  save (user: User) {
    this.usersRepository.save(user)
  }

  async findUsers (): Promise<User[]> {
    return await this.usersRepository.find({})
  }

  async findUserByName (username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: { results: true }
    })
    return user
  }

  @Cron('0 * * * * *')
  async updateStatus () {
    const users = await this.usersRepository.find({})
    users.forEach((usr) => {
      if (Date.now() - usr.lastAccess > 60000) {
        usr.status = 'offline'
        this.usersRepository.save(usr)
      }
    })
  }

  async findUser (ftId: number): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ ftId })
    if (user == null) return null
    user.lastAccess = Date.now()
    user.status = 'online'
    this.usersRepository.save(user)
    return user
  }

  async findOnlineUsers (): Promise<User[]> {
    return await this.usersRepository.find({ where: { status: 'online' } })
  }

  async create (userData: UserDto) {
    try {
      const newUser = this.usersRepository.create(userData)
      return await this.usersRepository.save(newUser)
    } catch (err) {
      throw new Error(`Error creating ${err} user ${err.message}`)
    }
  }

  async findOnlineInChannel (channel: Channel): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.channel = :chan', { chan: channel })
      .andWhere('user.status := status)', { status: 'online' })
      .getMany()
  }

  async update (user: User, changes: UserDto): Promise<User | null> {
    this.usersRepository.merge(user, changes)
    return await this.usersRepository.save(user)
  }

  async addAvatar (ftId: number, filename: string) {
    return await this.usersRepository.update(
      { ftId },
      {
        avatar: filename
      }
    )
  }

  async getFriends (ftId: number): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { ftId },
      relations: {
        friends: true
      }
    })
    if (user != null) return user.friends
    return []
  }

  async getInvits (ftId: number): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { ftId },
      relations: {
        followers: true
      }
    })
    if (user != null) return user.followers
    return []
  }

  async getResults (ftId: number): Promise<Result[]> {
    const user = await this.usersRepository.findOne({
      where: { ftId },
      relations: {
        results: {
          players: true
        }
      }
    })
    if (user != null) return user.results
    return []
  }

  async getLeader (): Promise<User[]> {
    return await this.usersRepository.find({
      order: {
        winrate: 'DESC'
      }
    })
  }

  async getRank (ftId: number): Promise<number> {
    const leader = await this.getLeader()
    return leader.findIndex((user) => user.ftId == ftId)
  }

  async invit (ftId: number, targetFtId: number) {
    const user = await this.usersRepository.findOne({
      where: { ftId },
      relations: {
        followers: true,
        friends: true
      }
    })
    if (user == null) {
      return new NotFoundException(`Error: user id ${ftId} isn't in our db.`)
    }
    if (user.friends.findIndex((friend) => friend.ftId === targetFtId) != -1) {
      return null
    }
    const target = await this.usersRepository.findOne({
      where: { ftId: targetFtId },
      relations: {
        followers: true,
        friends: true
      }
    })
    if (target == null) {
      return new NotFoundException(
        `Error: user id ${targetFtId} isn't in our db.`
      )
    }
    const id = user.followers.findIndex(
      (follower) => follower.ftId === targetFtId
    )
    if (id != -1) {
      console.log(
        `Friend relation complete between ${user.username} and ${target.username}`
      )
      user.friends.push(target)
      if (user.ftId != target.ftId) target.friends.push(user)
      user.followers.slice(id, 1)
      this.usersRepository.save(user)
    } else {
      console.log(`You asked ${target.username} to be your friend.`)
      target.followers.push(user)
    }
    this.usersRepository.save(target)
  }
}
