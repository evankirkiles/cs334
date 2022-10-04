/*
 * index.tsx
 * author: evan kirkiles
 * created on Fri Jul 22 2022
 * 2022 the nobot space, 
 */
import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import s from "./styles.module.scss";
import { World } from './game/world/World';
import _ from 'lodash';

type NobotGameProps = {
  world: string;
}

const NobotGame: React.FC<NobotGameProps> = function NobotGame({ world }) {
  // connect canvas to game
  const canvasRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const [overlayActive, setOverlayActive] = useState(true);

  useEffect(() => {
    const onDownloadStart = () => {
      setOverlayActive(overlayActive);
    }

    const onDownloadFinish = _.debounce(() => {
      setOverlayActive(false);
    }, 300);

    if (!canvasRef.current) return;
    // worldRef.current = new World(canvasRef.current!, '/models/world.glb');
    worldRef.current = new World(
      canvasRef.current!,
      world,
      {
        onDownloadStart,
        onDownloadFinish
      }
    );
  // @ts-ignore
  }, [world]);
  return (
    <>
      <div className={s.nobot_world} ref={canvasRef} />
      <CSSTransition
        in={overlayActive}
        timeout={300}
        nodeRef={overlayRef}
        mountOnEnter
        unmountOnExit>
        <div className={s.overlay} ref={overlayRef}>
          <b>LOADING...</b>
        </div>
      </CSSTransition>
    </>
  );
}

export default NobotGame;