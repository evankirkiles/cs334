/*
 * SocketControllerMinigame.tsx
 * author: evan kirkiles
 * created on Wed Sep 28 2022
 * 2022 the nobot space,
 */
import { useCallback, useEffect, useRef } from "react";
import s from "./SocketControllerMinigame.module.scss";

export type SocketControllerState = {
  button: "pressed" | "unpressed";
  joystick: { x: number; y: number };
  switch: "on" | "off";
};

type SocketControllerMinigameProps = {
  state: SocketControllerState;
};

const SocketControllerMinigame: React.FC<SocketControllerMinigameProps> =
  function SocketControllerMinigame({ state }) {
    // reference to the "player" so we don't need to update state to
    // update his transform––all this will happen outside the react loop.
    const playerRef = useRef<HTMLImageElement>(null);
    const playerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const animationFrame = useRef<number>();

    // asynchronous function for an animation loop
    const animationRequest = useCallback(() => {
      // GAME LOGIC:
      //  - Joystick controls player movement.
      //  - Button controls player speed between sprinting / normal.
      //  - Switch controls direction player moves in, positive vs. negative axes.
      const speed = state.button === "pressed" ? 2 : 1;
      const direction =
        state.joystick.x === state.joystick.y
          ? [0, 0]
          : [-state.joystick.x, state.joystick.y];
      const magnitude = state.switch === "on" ? 1 : -1;
      // update playerPos
      playerPos.current.x += speed * direction[0] * magnitude;
      playerPos.current.y += speed * direction[1] * magnitude;
      const { x, y } = playerPos.current;
      // propogate changes to player div
      playerRef.current!.style.transform = `translate(${x}px, ${y}px)`;

      // finally, continue the loop on the next animation frame
      animationFrame.current = requestAnimationFrame(animationRequest);
    }, [state]);

    // manage game state here
    useEffect(() => {
      // begin the animation loop
      animationRequest();
      // on dismount / state change, cancel animation frame
      return () => {
        if (animationFrame.current)
          cancelAnimationFrame(animationFrame.current);
      };
    }, [animationRequest]);

    return (
      <div className={s.sensor_fun_canvas}>
        <img src="/img/evan-head.png" alt="evan head" className={s.fun_player} ref={playerRef} />
        <div className={s.control_text}>world&apos;s worst game.</div>
        <div className={s.sub_controls_text}>
          - Joystick to move on X+ and Y+ axes<br />
          - Switch to invert movement<br />
          - Button to &quot;sprint&quot;
        </div>
        <div
          className={s.control_text}
          style={{ top: "unset", bottom: "10px", right: "10px", left: "unset" }}
        >
          now with 3 modes of operation!
        </div>
      </div>
    );
  };

export default SocketControllerMinigame;
