/*
 * SocketControllerDisplay.tsx
 * author: evan kirkiles
 * created on Wed Sep 28 2022
 * 2022 the nobot space,
 */
import { useCallback, useEffect, useState } from "react";
import s from "./SocketControllerDisplay.module.scss";

// helper function for converting joystick input into a CSS transform
const joystickToTransform = (
  { x, y }: { x: number; y: number },
  scale: number = 50
): string => {
  var angle = Math.atan2(x, y);
  var degrees = (180 * angle) / Math.PI;
  return `rotate(${degrees}deg) translateY(-70%)`;
};

type SocketControllerDisplayProps = {
  url: string;
};

const SocketControllerDisplay: React.FC<SocketControllerDisplayProps> =
  function ({ url }) {
    // connect to the websocket instance
    const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);
    // which controller we're connected to in this client
    const [controllerNumber, setControllerNumber] = useState<number | null>(
      null
    );
    // the current state of the controller, including what inputs it uses
    const [controllerState, setControllerState] = useState<{
      button: string;
      switch: string;
      joystick: {
        x: number;
        y: number;
      };
    }>({
      button: "unpressed",
      switch: "off",
      joystick: {
        x: 1,
        y: 1,
      },
    });

    // updates our tracking of the controller's current state
    const updateInputState = useCallback(
      ({ data }: { data: string }) => {
        const { controller, message: payload } = JSON.parse(data);
        setControllerNumber(controller);
        if (payload["type"] === "state") {
          delete payload["type"];
          setControllerState(payload);
        } else {
          const key = payload["type"];
          const value = payload["data"];
          if (key in controllerState) {
            const newState = { ...controllerState };
            // @ts-ignore
            newState[key as keyof typeof controllerState] = value;
            setControllerState(newState);
          }
        }
      },
      [controllerState]
    );

    // initialize websocket and listener on page load
    useEffect(() => {
      let ws: WebSocket;
      if (!wsInstance) {
        // Create a new connection
        ws = new WebSocket(url);
        setWsInstance(ws);
      } else {
        ws = wsInstance;
      }
      // add listener
      ws.onmessage = updateInputState;
      return () => {
        if (wsInstance && wsInstance.readyState !== 3) {
          wsInstance.close();
        }
      };
    }, []);

    // update the listener when stale
    useEffect(() => {
      if (!wsInstance) return;
      wsInstance.onmessage = updateInputState;
    }, [updateInputState]);

    return (
      <>
        <div className={s.state_container}>
          <div className={s.connection_info}>
            {wsInstance === null
              ? "Connection not yet opened"
              : wsInstance.readyState === wsInstance.CONNECTING
              ? "Connecting"
              : wsInstance.readyState === wsInstance.CLOSED
              ? "Error connecting"
              : "Connected"}{" "}
            to {url}
            <br />↳ Controller [
            {controllerNumber ?? "none found, showing preview"}]
          </div>
          {Object.entries(controllerState).map(([type, data]) => {
            return (
              <div key={type} className={s.sensor_display}>
                <div className={s.sensor_canvas}>
                  {type === "button" ? (
                    <>
                      <div
                        className={`${s.sensor_button_top}`}
                        style={{
                          transform:
                            data === "pressed" ? "translateY(30%)" : undefined,
                        }}
                      />
                      <div className={s.sensor_button_base} />
                    </>
                  ) : type === "switch" ? (
                    <>
                      <div
                        className={s.sensor_switch_top}
                        style={{
                          transform:
                            data === "on" ? "rotate(45deg)" : "rotate(-45deg)",
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
              </div>
            );
          })}
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

export default SocketControllerDisplay;
