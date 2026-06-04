import { Server as SocketServer } from 'socket.io';

let io;

export function initSocket(httpServer) {
  io = new SocketServer(httpServer, {
    cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    socket.on('join_room', (userId) => socket.join(`user_${userId}`));
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket not initialized');
  return io;
}