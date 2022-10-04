/*
 * SocketControllerDisplay.tsx
 * author: evan kirkiles
 * created on Wed Sep 28 2022
 * 2022 the nobot space,
 */
import { useCallback, useEffect, useState } from "react";
import s from "./ESP32SocketControllerDisplay.module.scss";

// helper function for converting joystick input into a CSS transform
const joystickToTransform = (
  { x, y }: { x: number; y: number },
  scale: number = 50
): string => {
  // var angle = Math.atan2(x, y);
  // var degrees = (180 * angle) / Math.PI;
  return `translate(${-x * 100}%, ${y * 100}%)`;
};

type SocketControllerDisplayProps = {
  url: string;
};

const ESP32SocketControllerDisplay: React.FC<SocketControllerDisplayProps> =
  function ({ url }) {
    // connect to the websocket instance
    const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);
    // which controller we're connected to in this client
    const [controllerID, setControllerID] = useState<string | null>(
      null
    );
    // the current state of the controller, including what inputs it uses
    const [controllerState, setControllerState] = useState<{
      buttons: number;
      js_x: number;
      js_y: number;
    }>({
      buttons: 0,
      js_x: 0,
      js_y: 0
    });

    // updates our tracking of the controller's current state
    const onWsMessage = useCallback(
      ({ data: body }: { data: string }) => {
        // parse the message, which is JSON
        const data = JSON.parse(body);
        switch (data.type) {
          case "controller_list":
            // if this is a list of controllers, and we don't have a controller,
            // pick the first one as our controller to use
            if (!controllerID && data.data.length > 0)
              setControllerID(data.data[0]);
            break;
          case "controller_state":
            // on controller state information, set the controller state
            // from the remote.
            setControllerState(data.data);
            break;
          default:
            console.log(data);
            break;
        }
      },
      [setControllerState]
    );

    // initialize websocket and listener on page load
    useEffect(() => {
      let ws: WebSocket;
      if (!wsInstance) {
        // Create a new connection
        ws = new WebSocket(url);
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "client_type", data: "consumer" }));
        };
        setWsInstance(ws);
      } else {
        ws = wsInstance;
      }
      return () => {
        if (wsInstance && wsInstance.readyState !== 3) {
          wsInstance.close();
        }
      };
    }, [url, wsInstance]);

    // update the listener when stale
    useEffect(() => {
      if (!wsInstance) return;
      wsInstance.onmessage = onWsMessage;
    }, [onWsMessage, wsInstance]);

    // when we update the controllerID state, we also send a message that
    // tells the websocket to connect our client to that controller
    useEffect(() => {
      if (wsInstance && controllerID) {
        wsInstance.send(JSON.stringify({ type: "connect_to_controller", data: controllerID }));
      }
    }, [wsInstance, controllerID]);

    // switch 1 is on bit 1, switch 2 is on 
    const buttonOn = controllerState.buttons & 0b01; 
    const switchOn = controllerState.buttons & 0b10;

    return (
      <>
        <div className={s.state_container}>
          <div className={s.connection_info}>
            {wsInstance === null
              ? "Connection not yet opened"
              : wsInstance.readyState === wsInstance.CONNECTING
              ? "Connected"
              : wsInstance.readyState === wsInstance.CLOSED
              ? "Error connecting"
              : "Connecting"}{" "}
            to {url}
            <br />↳ Controller [
            {controllerID ?? "none found, showing preview"}]
          </div>
          <div className={s.sensor_display}>
            <div className={s.sensor_canvas}>
              <div
                className={`${s.sensor_button_top}`}
                style={{
                  transform:
                  buttonOn ? "translateY(30%)" : undefined,
                }}
              />
              <div className={s.sensor_button_base} />
            </div>
            BUTTON
            <div className={s.sensor_caption}>{buttonOn ? "PRESSED" : "UNPRESSED"}</div>
          </div>
          <div className={s.sensor_display}>
            <div className={s.sensor_canvas}>
            <div
                    className={s.sensor_switch_top}
                    style={{
                      transform:
                      switchOn ? "rotate(45deg)" : "rotate(-45deg)",
                    }}
                  />
                  <div className={s.sensor_button_base} />
            </div>
            SWITCH
            <div className={s.sensor_caption}>{switchOn ? "ON" : "OFF"}</div>
          </div>
          <div className={s.sensor_display}>
            <div className={s.sensor_canvas}>
            <div className={s.sensor_joystick_base} />
                  <div
                    className={s.sensor_joystick_knob}
                    style={{
                      transform: joystickToTransform({ x: controllerState.js_x, y: controllerState.js_y}),
                    }}
                  />
            </div>
            JOYSTICK
            <div className={s.sensor_caption}>{`X: ${controllerState.js_x} Y: ${controllerState.js_y}`}</div>
          </div>
              {/* <div className={s.sensor_button_base} />
              ) : type === "switch" ? (
                <>
                  <div
                    className={s.sensor_switch_top}
                    style={{
                      transform:
                      switchOn ? "rotate(45deg)" : "rotate(-45deg)",
                    }}
                  />
                  <div className={s.sensor_button_base} />
                </>
              ) : (
                <>
                  <div className={s.sensor_joystick_base} />
                  <div
                    className={s.sensor_joystick_knob}
                    style={{
                      transform: joystickToTransform(data as any),
                    }}
                  />
                </>
              )}
            </div>
            {type}
            <div className={s.sensor_caption}>{JSON.stringify(data)}</div>
          </div> */}
          {wsInstance === null ? (
            "Connection not opened"
          ) : wsInstance.CONNECTING ? (
            "Connecting..."
          ) : (
            <></>
          )}
        </div>
      </>
    );
  };

export default ESP32SocketControllerDisplay;
