require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");

const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    const serverHttp = http.createServer(app).listen(process.env.PORT, () => {
      console.log(`http server running in port ${process.env.PORT}`);
    });

    const io = new Server(serverHttp);

    io.adapter(createAdapter(pubClient, subClient));

    io.on("connection", (socket) => {
      console.log("a user connected");
      socket.on("user:register", (userId) => {
        console.log(`user registered ${userId}`);
        socket.join(userId);
        socket.data.userId = userId;
      });

      socket.on("user:ping", (userId) => {
        console.log(`ping from ${userId}`);
        socket
          .to(userId)
          .emit("pong", { from: socket.data.userId, host: os.hostname() });
      });
    });
  })
  .catch((e) => {
    console.log("starting server:", e);
  });
