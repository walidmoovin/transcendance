import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entity/user.entity'
import { type UserDto } from './dto/user.dto'
import { type Channel } from 'src/chat/entity/channel.entity'

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) {}

  save(user: User) {
    this.usersRepository.save(user)
  }

  async findUsers (): Promise<User[]> {
    return await this.usersRepository.find({})
  }

  async findUserByName (username: string): Promise<User | null> {
    let user = await this.usersRepository.findOne({
      where: { username: username }, 
      relations : {results: true}
      
    })
    if (!user) return null;
    else return user;
  }

  async findUser (ftId: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ ftId })
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
    if (user == null) return []
    return user.friends
  }

  async getInvits (ftId: number) {
    const user = await this.usersRepository.findOne({
      where: { ftId },
      relations: {
        followers: true
      }
    })
    if (user == null) return null
    return user.followers
  }

  async invit (ftId: number, targetFtId: number) {
    const user = await this.usersRepository.findOne({
      where: { ftId },
      relations: {
        followers: true,
        friends: true,
      }
    })
    if (user == null) return null
    if (user.friends.findIndex(
      (friend) => friend.ftId === targetFtId) != -1)
      return null
    const target = await this.usersRepository.findOne({
      where: { ftId: targetFtId },
      relations: {
        followers: true,
        friends: true,
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
      if (user != target)
        target.friends.push(user)
      user.followers.slice(id, 1)
      this.usersRepository.save(user)
    } else {
      console.log(`You asked ${target.username} to be your friend.`)
      target.followers.push(user)
    }
    this.usersRepository.save(target)
  }
}
