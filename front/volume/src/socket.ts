import ioClient from "socket.io-client";

export const io = ioClient("http://localhost:3001", {
  withCredentials: true,
});
