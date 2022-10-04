import express from "express";
import { Server } from "ws";
import type { WebSocket } from "ws";
import short from "short-uuid";

const PORT = process.env.PORT || 3000;
const INDEX = "/index.html";

// websocket object to keep track of all clients
const sockets: { [key: string]: WebSocket } = {};
// keep track of consumers of controller events
const consumers: string[] = [];
const controllers: string[] = [];
// keep track of which consumers are connected to which controllers
const controller_consumers: { [key: string]: string[] } = {};

// initialize express server
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
// build web socket server through that server
const wss = new Server({ server });

// on connect, set up the websocket
wss.on("connection", (ws) => {
  // get the current client's id
  const userID = short.generate().substring(0, 5);
  sockets[userID] = ws;
  // log who has connected
  console.log(`[${userID}] CONNECTED`);

  /* -------------------------------------------------------------------------- */
  /*                               MESSAGE PARSING                              */
  /* -------------------------------------------------------------------------- */

  // listen for messages from that client
  ws.on("message", (data) => {
    // decode the packet
    const packet = JSON.parse(data.toString());

    switch (packet.type) {
      // client_type tells the server if this is a controller or a consumer
      case "client_type":
        if (packet.data === "controller") {
          console.log(`[${userID}] Type set: CONTROLLER`);
          // if this is a controller, add it to the list
          controllers.push(userID);
          controller_consumers[userID] = [];
          // and let all the consumers know of what controllers are available
          consumers.forEach((consumer) => {
            sockets[consumer].send(
              JSON.stringify({
                type: "controller_list",
                data: controllers,
              })
            );
          });
        } else {
          console.log(`[${userID}] Type set: CONSUMER`);
          // otherwise, this must be a consumer
          consumers.push(userID);
          // send it the current list of controllers
          ws.send(
            JSON.stringify({
              type: "controller_list",
              data: controllers,
            })
          );
        }
        break;
      // default simply broadcasts to all listeners. this is what the
      // controller emits.
      case "controller_state":
        // we know this must be a controller. send its listeners its state.
        controller_consumers[userID].forEach((consumer) => {
          sockets[consumer].send(JSON.stringify(packet.data));
        });
        break;
      // connect to controller allows clients to listen only to a specific
      // controller.
      case "connect_to_controller":
        // we know this must be a consumer. add it to the controller's list
        const controller_id = packet.data;
        const curr_index = controller_consumers[controller_id].indexOf(userID);
        if (curr_index === -1) {
          controller_consumers[controller_id].push(userID);
        }
        break;
      // don't do anything in default case
      default:
        break;
    }
  });

  /* -------------------------------------------------------------------------- */
  /*                              SOCKET DISCONNECT                             */
  /* -------------------------------------------------------------------------- */

  // on websocket closing, remove the consumer / controller from the lists
  ws.on("close", () => {
    // log who has connected
    console.log(`[${userID}] DISCONNECTED`);

    // remove the client from the list of sockets
    delete sockets[userID];
    // remove it from consumers
    const consumer_i = consumers.indexOf(userID);
    if (consumer_i !== -1) {
      consumers.splice(consumer_i, 1);
      // remove the controller from any controller_consumer lists
      for (const controller in controller_consumers) {
        const controller_consumer_i =
          controller_consumers[controller].indexOf(userID);
        if (controller_consumer_i !== -1) {
          controller_consumers[controller].splice(controller_consumer_i, 1);
        }
      }
    }
    // remove it from controllers
    const controller_i = controllers.indexOf(userID);
    if (controller_i !== -1) {
      controllers.splice(controller_i, 1);
      delete controller_consumers[userID];
    }
  });
});
