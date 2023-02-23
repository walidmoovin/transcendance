import { type WebSocket } from 'ws'

export class Spectator {
  socket: WebSocket
  uuid: string
  name: string

  constructor (socket: WebSocket, uuid: string, name: string) {
    this.socket = socket
    this.uuid = uuid
    this.name = name
  }
}
