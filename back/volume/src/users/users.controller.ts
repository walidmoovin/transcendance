import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe
} from '@nestjs/common'
import { type User } from './user.entity'
import { UsersService } from './users.service'
import { CreateUserDto, UpdateUserDto } from './user.dto'
@Controller('users')
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers (): Promise<User[]> {
    return await this.usersService.getAllUsers()
  }

  @Post()
  async create (@Body() payload: CreateUserDto) {
    return await this.usersService.create(payload)
  }

  @Post(':id')
  update (@Param('id', ParseIntPipe) id: number, @Body() user: UpdateUserDto) {
    this.usersService.update(id, user)
  }
}
