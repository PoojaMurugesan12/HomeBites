import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { CLIENT_URL } from './config/constants';
import { verifyToken } from './utils/token';

let io: Server | null = null;

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true
    }
  });

  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.split(';')
        .find((c) => c.trim().startsWith('homebites_session='))
        ?.split('=')[1];

      if (token) {
        const payload = verifyToken(token);
        (socket as any).userId = payload.userId;
      }
      next();
    } catch (err) {
      // Allow unauthenticated connection or degrade gracefully
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    // Join kitchen scoped room
    socket.on('join_kitchen', (kitchenId: string) => {
      if (kitchenId) {
        socket.join(`kitchen_${kitchenId}`);
      }
    });

    socket.on('leave_kitchen', (kitchenId: string) => {
      if (kitchenId) {
        socket.leave(`kitchen_${kitchenId}`);
      }
    });
  });

  return io;
}

export function emitToKitchen(kitchenId: string, event: string, data: any) {
  if (io) {
    io.to(`kitchen_${kitchenId}`).emit(event, data);
  }
}

export function getIO(): Server | null {
  return io;
}
