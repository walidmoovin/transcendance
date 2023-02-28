import { type Request } from 'express'
import type User from 'src/users/user.entity'

interface RequestWithUser extends Request {
  user: User
}

export default RequestWithUser
