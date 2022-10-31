import express from "express";
import { Server } from "ws";
import fs from "fs";
import path from "path";
import NotarySession from "./NotarySession";

const PORT = process.env.PORT || 3000;
const INDEX = "/index.html";

// initialize express server
const app = express();

// add our public folders for file uploads
app.use("/public", express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public"));

/* ------------------------------ IMAGE UPLOAD ------------------------------ */

// listen for image POST uploads at /image
app.post("/image", (req, res) => {
  console.log("Image posted...");
  let data = Buffer.from([]);
  req.on("data", function (chunk) {
    data = Buffer.concat([data, chunk]);
  });
  req.on("end", function () {
    const filePath = path.join(__dirname, "..", "public", "image.jpg");
    console.log(data.byteLength);
    fs.writeFile(filePath, data, () => {
      console.log(`Image written to ${filePath}`);
      res.end();
    });
  });
});

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

/* ------------------------------- WEB SOCKET ------------------------------- */

// build web socket server through that server
const wss = new Server({ server });
const notary = new NotarySession();

// on connect, set up the websocket in the notary system
wss.on("connection", notary.onConnection.bind(notary));
