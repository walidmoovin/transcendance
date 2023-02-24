import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import { type Profile } from 'passport-42'

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Profile => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  }
)
