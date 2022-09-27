import express from "express";
import { Server } from "ws";

const PORT = process.env.PORT || 3000;
const INDEX = "/index.html";

// initialize express server
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
// build web socket server through that server
const wss = new Server({ server });

// on connect, set up the websocket
wss.on("connection", (ws) => {
  // producer refers to the controller
  console.log("Client connected");
  ws.on("message", (data) => console.log(data.toString()));
  ws.on("close", () => console.log("Client disconnected"));
});

// every 1 second, send client the date
setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);
