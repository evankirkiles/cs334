/*
 * NobotWorld.tsx
 * author: evan kirkiles
 * created on Mon Sep 12 2022
 * 2022 the nobot space,
 */

import { useEffect, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { World } from "./game/world/World";
import s from "./NobotWorld.module.scss";
import _ from "lodash";

type NobotWorldProps = {
  world: string;
  windowsStart: number;
  windowsEnd: number;
  rotated?: boolean;
};

const NobotWorld: React.FC<NobotWorldProps> = function NobotWorld({
  world,
  windowsStart,
  windowsEnd,
  rotated
}) {
  // connect canvas to game
  const canvasRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const [overlayActive, setOverlayActive] = useState(true);

  useEffect(() => {
    const onDownloadStart = () => {
      setOverlayActive(overlayActive);
    };

    const onDownloadFinish = _.debounce(() => {
      setOverlayActive(false);
    }, 300);

    if (!canvasRef.current) return;
    // worldRef.current = new World(canvasRef.current!, '/models/world.glb');
    worldRef.current = new World(
      canvasRef.current!,
      {
        windowsStart,
        windowsEnd,
        rotated
      },
      world,
      {
        onDownloadStart,
        onDownloadFinish,
      }
    );
  }, [world]);

  return (
    <>
      <div className={s.nobot_world} ref={canvasRef} />
      <CSSTransition
        in={overlayActive}
        timeout={300}
        nodeRef={overlayRef}
        mountOnEnter
        unmountOnExit
      >
        <div className={s.overlay} ref={overlayRef}>
          <b>LOADING...</b>
        </div>
      </CSSTransition>
    </>
  );
};

export default NobotWorld;
