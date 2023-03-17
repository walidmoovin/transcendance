import { io, Socket } from "socket.io-client";

export const socket: Socket = io("http://" + (import.meta.env.VITE_HOST ?? 'localhost') + ":3001");
