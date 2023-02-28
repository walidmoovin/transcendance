import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { type CreateUserDto, type UpdateUserDto } from './user.dto'
import { type Channel } from 'src/chat/model/channel.entity'

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) {}

  async getAllUsers (): Promise<User[]> {
    return await this.usersRepository.find({})
  }

  async getOneUser (username: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ username })
  }

  async getOneUser42 (id_42: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id_42 })
  }

  async create (userData: CreateUserDto) {
    try {
      const newUser = this.usersRepository.create(userData)
      return await this.usersRepository.save(newUser)
    } catch (err) {
      throw new Error(`Error creating ${err} user ${err.message}`)
    }
  }

  async findOne (id: number) {
    const user = await this.usersRepository.findOneBy({ id })
    if (user) return user
    throw new NotFoundException(`User #${id} not found`)
  }

  async findOnlineInChannel (channel: Channel): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.channel = :chan', { chan: channel })
      .andWhere('user.status := status)', { status: 'online' })
      .getMany()
  }

  async update (id: number, changes: UpdateUserDto) {
    const updatedUser = await this.findOne(id)
    this.usersRepository.merge(updatedUser, changes)
    return await this.usersRepository.save(updatedUser)
  }

  async addAvatar (userId: number, filename: string) {
    await this.usersRepository.update(userId, {
      avatar: filename
    })
  }
}
