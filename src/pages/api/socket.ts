import type { NextApiRequest } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import { Server as IOServer } from "socket.io";

type SocketServer = HTTPServer & {
  io?: IOServer;
};

type NextApiResponseWithSocket = {
  socket: NetSocket & { server: SocketServer };
  end: () => void;
};

export default function handler(_req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("join-room", ({ room, name }) => {
        const peers = Array.from(io.sockets.adapter.rooms.get(room) || []);
        socket.join(room);
        socket.emit("existing-peers", peers);
        socket.to(room).emit("peer-joined", { id: socket.id, name });
      });

      socket.on("signal", ({ room, signal, target }) => {
        socket.to(target || room).emit("signal", { id: socket.id, signal });
      });

      socket.on("meeting-chat", ({ room, message, name }) => {
        io.to(room).emit("meeting-chat", { id: socket.id, message, name, at: new Date().toISOString() });
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
