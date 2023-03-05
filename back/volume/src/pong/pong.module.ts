import { Module } from '@nestjs/common'
import { PongGateway } from './pong.gateway'
import Result from './entity/result.entity'
import {TypeOrmModule } from '@nestjs/typeorm'
import {PongService } from './pong.service'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Result])
  ],
  providers: [PongGateway, PongService],
  exports: [PongService]
})
export class PongModule {}
