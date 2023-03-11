import { BadRequestException, Catch, Injectable } from '@nestjs/common'
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

  async save (user: User): Promise<void> {
    await this.usersRepository.save(user)
  }

  async findUsers (): Promise<User[]> {
    const users = await this.usersRepository.find({})
    users.forEach((usr) => {
      usr.socketKey = ''
    })
    return users
  }

  async findUserByName (username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: { results: true }
    })
    if (user == null) throw new BadRequestException('User not found.')
    return user
  }

  @Cron('0 * * * * *')
  async updateStatus (): Promise<void> {
    const users = await this.usersRepository.find({})
    users.forEach((usr) => {
      if (Date.now() - usr.lastAccess > 60000) {
        usr.status = 'offline'
        this.usersRepository.save(usr).catch((err) => {
          console.log(err)
        })
      }
    })
  }

  async findUser (ftId: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ ftId })
    if (user == null) throw new BadRequestException('User not found.')
    user.lastAccess = Date.now()
    if (user.status === 'offline') user.status = 'online'
    await this.usersRepository.save(user)
    return user
  }

  async findOnlineUsers (): Promise<User[]> {
    const users = await this.usersRepository.find({
      where: { status: 'online' }
    })
    users.forEach((usr) => {
      usr.socketKey = ''
    })
    return users
  }

  async create (userData: UserDto): Promise<User | null> {
    try {
      const newUser = this.usersRepository.create(userData)
      return await this.usersRepository.save(newUser)
    } catch (err) {
      throw new BadRequestException('User already exists.')
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

  async addAvatar (ftId: number, filename: string): Promise<void> {
    await this.usersRepository.update({ ftId }, { avatar: filename })
  }

  async getFriends (ftId: number): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { ftId },
      relations: { friends: true }
    })
    if (user == null) throw new BadRequestException('User not found.')
    return user.friends
  }

  async getInvits (ftId: number): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { ftId },
      relations: {
        followers: true
      }
    })
    if (user == null) throw new BadRequestException('User not found.')
    return user.followers
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
    if (user == null) throw new BadRequestException('User not found.')
    return user.results
  }

  async getLeaderboard (): Promise<User[]> {
    return await this.usersRepository.find({
      order: {
        winrate: 'DESC'
      }
    })
  }

  async getRank (ftId: number): Promise<number> {
    const leader = await this.getLeaderboard()
    return leader.findIndex((user) => user.ftId === ftId)
  }

  async invit (ftId: number, targetFtId: number): Promise<void> {
    const user: User | null = await this.usersRepository.findOne({
      where: { ftId },
      relations: {
        followers: true,
        friends: true
      }
    })
    if (user == null) throw new BadRequestException('User not found.')
    if (user.friends.findIndex((friend) => friend.ftId === targetFtId) !== -1) {
      throw new BadRequestException('You are already friends.')
    }
    const target: User | null = await this.usersRepository.findOne({
      where: { ftId: targetFtId },
      relations: {
        followers: true,
        friends: true
      }
    })
    if (target == null) throw new BadRequestException('Target not found.')
    const id = user.followers.findIndex(
      (follower) => follower.ftId === targetFtId
    )
    if (id !== -1) {
      user.friends.push(target)
      if (user.ftId !== target.ftId) target.friends.push(user)
      user.followers.slice(id, 1)
      await this.usersRepository.save(user)
    } else target.followers.push(user)
    await this.usersRepository.save(target)
  }
}
