require("dotenv").config();
const Client = require("socket.io-client");

clientSocket = new Client(
  // `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`,
  `http://localhost:4000`,
  {
    transports: ["websocket"],
  }
);

clientSocket.on("pong", (msg) => {
  console.log(`pong ${JSON.stringify(msg)}`);
  clientSocket.emit("ping", msg["from"]);
});
clientSocket.on("connect", function () {
  console.log("connected");
  clientSocket.emit("user:register", "test-342342342");
});

console.log("waiting to get connected");
