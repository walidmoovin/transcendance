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

  async findUsers (): Promise<User[]> {
    return await this.usersRepository.find({})
  }

  async findUserByName (username: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ username })
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

  async update (ftId: number, changes: UserDto):Promise < User | null> {
    const updatedUser = await this.findUser(ftId)
    if (!updatedUser) return null
    this.usersRepository.merge(updatedUser, changes)
    return await this.usersRepository.save(updatedUser)
  }

  async addAvatar (ftId: number, filename: string) {
    return await this.usersRepository.update(ftId, {
      avatar: filename
    })
  }

  async getFriends (ftId: number): Promise< User[] >{
    const user = await this.usersRepository.findOne({
      where: { ftId },
      relations: {
        friends: true
      }
    })
    if (!user) return []
    return user.friends
  }

  async getInvits (ftId: number) {
    const user = await this.usersRepository.findOne({
      where: { ftId },
      relations: {
        followers: true
      }
    })
    if (!user) return null
    return user.followers
  }

  async invit (ftId: number, targetFtId: number) {
    const user = await this.findUser(ftId)
    if (!user) return null
    const target = await this.findUser(targetFtId)
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
