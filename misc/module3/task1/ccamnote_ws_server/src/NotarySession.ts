/*
 * NotarySession.ts
 * author: evan kirkiles
 * created on Sun Oct 30 2022
 * 2022 the nobot space,
 */
import short from "short-uuid";
import type { WebSocket } from "ws";

/* -------------------------------------------------------------------------- */
/*                                   TYPINGS                                  */
/* -------------------------------------------------------------------------- */

type ControllerState = {
  joystick_ystate: number;
  joystick_xstate: number;
  button_pressed: number;
  just_pressed: boolean;
};

type ControllerStateMinimal = [number, number, number, boolean];

enum MessageType {
  ClientType = "client_type",
  ControllerState = "controller_state",
  ConnectToController = "connect_to_controller",
}

/* -------------------------------------------------------------------------- */
/*                               NOTARY SESSION                               */
/* -------------------------------------------------------------------------- */

export default class NotarySession {
  // keep track of sockets for each user
  sockets: Record<string, WebSocket> = {};

  // keep track of client ids of consumers of controller events
  consumers: string[] = [];
  controllers: string[] = [];
  camerasMAC: string[] = []; // these are MAC addresses instead
  // keep track of which consumers are connected to which controllers
  controller_consumers: { [key: string]: string[] } = {};

  constructor() {
    this.sockets = {};
    this.consumers = [];
    this.controllers = [];
    this.camerasMAC = [];
    this.controller_consumers = {};
  }

  /* -------------------------------------------------------------------------- */
  /*                              EVENT: connection                             */
  /* -------------------------------------------------------------------------- */

  onConnection(ws: WebSocket) {
    const uid = short.generate().substring(0, 5);
    this.sockets[uid] = ws;
    // log who has connected
    console.log(
      `[${uid}] connected. ${Object.keys(this.sockets).length} total.`
    );

    // attach the server data listener
    ws.on("message", (data) => {
      const packet = JSON.parse(data.toString());
      switch (packet.type as MessageType) {
        case MessageType.ClientType:
          switch (packet.data) {
            case "controller":
              this.addController(uid);
              break;
            case "camera":
              this.addCamera(uid);
              break;
            default:
              this.addConsumer(uid);
              break;
          }
          console.log(
            `- Cameras: (${this.camerasMAC.length}), Controllers: (${this.controllers.length}), Consumers: (${this.consumers.length})`
          );
          break;
        case MessageType.ControllerState:
          this.broadcastControllerState(uid, packet.data);
          break;
        case MessageType.ConnectToController:
          this.connectToController(uid, packet.data);
          break;
      }
    });

    // attach the disconnect listener
    ws.on("close", this.disconnection(uid));
  }

  /* -------------------------------------------------------------------------- */
  /*                             EVENT: client_type                             */
  /* -------------------------------------------------------------------------- */

  /**
   * Adds a joystick + button controller to the current websocket session.
   * @param uid
   */
  addController(uid: string) {
    console.log(`[${uid}] identified as CONTROLLER.`);
    this.controllers.push(uid);
    this.controller_consumers[uid] = [];
    this.consumers.forEach((consumer) => {
      this.sockets[consumer].send(
        JSON.stringify({
          type: "controller_list",
          data: this.controllers,
        })
      );
    });
  }

  /**
   * Adds a consumer to the current websocket session.
   * @param uid
   */
  addConsumer(uid: string) {
    console.log(`[${uid}] identified as CONSUMER.`);
    this.consumers.push(uid);
    this.sockets[uid].send(
      JSON.stringify({
        type: "controller_list",
        data: this.controllers,
      })
    );
  }

  /**
   * Nothing to do upon first camera addition. We save it under its MAC address
   * so that we can reference it to take a picture from a specific controller.
   * @param macAddress The MAC address of the camera
   */
  addCamera(macAddress: string) {
    console.log(`[${macAddress}] identified as CAMERA.`);
    this.camerasMAC.push(macAddress);
  }

  /* -------------------------------------------------------------------------- */
  /*                           EVENT: controller_state                          */
  /* -------------------------------------------------------------------------- */

  /**
   * Broadcasts the state of the controller to all of those listening to it..
   * @param uid
   * @param data
   */
  broadcastControllerState(uid: string, dataState: ControllerStateMinimal) {
    const data: ControllerState = {
      joystick_ystate: dataState[0],
      joystick_xstate: dataState[1],
      button_pressed: dataState[2],
      just_pressed: dataState[3],
    };
    // when button is just pressed, tell the camera to take a picture
    if (data.just_pressed) {
      this.camerasMAC.forEach((camera) => {
        this.sockets[camera].send("take_picture");
      });
    }
    this.controller_consumers[uid].forEach((consumer) => {
      this.sockets[consumer].send(
        JSON.stringify({
          type: "controller_state",
          data,
        })
      );
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                        EVENT: connect_to_controller                        */
  /* -------------------------------------------------------------------------- */

  /**
   * Adds a client to a specific controller
   * @param uid
   * @param cid
   */
  connectToController(uid: string, cid: string) {
    const curr_index = this.controller_consumers[cid].indexOf(uid);
    if (curr_index === -1) this.controller_consumers[cid].push(uid);
  }

  /* -------------------------------------------------------------------------- */
  /*                              DISCONNECT EVENT                              */
  /* -------------------------------------------------------------------------- */

  // on websocket closing, remove the client from the lists
  disconnection(uid: string) {
    return () => {
      // log who has disconnected
      delete this.sockets[uid];
      console.log(
        `[${uid}] disconnected. ${Object.keys(this.sockets).length} total.`
      );
      const consumer_i = this.consumers.indexOf(uid);
      // if it was a consumer, remove it from consumer lists
      if (consumer_i !== -1) {
        this.consumers.splice(consumer_i, 1);
        // remove the controller from any controller_consumer lists
        for (const controller in this.controller_consumers) {
          const controller_consumer_i =
            this.controller_consumers[controller].indexOf(uid);
          if (controller_consumer_i !== -1) {
            this.controller_consumers[controller].splice(
              controller_consumer_i,
              1
            );
          }
        }
      }
      // if it was a controller, remove it from the controllers
      const controller_i = this.controllers.indexOf(uid);
      if (controller_i !== -1) {
        this.controllers.splice(controller_i, 1);
        delete this.controller_consumers[uid];
      }
      // if it was a camera, remove it from the camera
      const camera_i = this.camerasMAC.indexOf(uid);
      if (camera_i !== -1) {
        this.camerasMAC.splice(camera_i, 1);
      }
      console.log(
        `- Cameras: (${this.camerasMAC.length}), Controllers: (${this.controllers.length}), Consumers: (${this.consumers.length})`
      );
    };
  }
}
