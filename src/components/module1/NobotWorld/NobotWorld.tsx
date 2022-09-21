/*
 * NobotWorld.tsx
 * author: evan kirkiles
 * created on Mon Sep 12 2022
 * 2022 the nobot space,
 */

import { useEffect, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { CCAMOptions, World } from "./game/world/World";
import s from "./NobotWorld.module.scss";
import _ from "lodash";
import React from "react";

type NobotWorldProps = {
  world: string;
};

const NobotWorld: React.FC<NobotWorldProps & CCAMOptions> =
  function NobotWorld({ world, ...ccamOptions }) {
    // connect canvas to game
    const canvasRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const worldRef = useRef<World | null>(null);
    const [overlayActive, setOverlayActive] = useState(true);

    useEffect(() => {
      // if world doesn't exist, create it
      if (!worldRef.current) {
        const onDownloadStart = () => {
          setOverlayActive(overlayActive);
        };

        const onDownloadFinish = _.debounce(() => {
          setOverlayActive(false);
        }, 300);

        if (!canvasRef.current) return;
        worldRef.current = new World(canvasRef.current!, ccamOptions, world, {
          onDownloadStart,
          onDownloadFinish,
        });
      } else {
        // otherwise, we're just changing rendering settings
        if (worldRef.current.cameraOperator) {
          worldRef.current.cameraOperator.render_frames =
            ccamOptions.render_frames;
          worldRef.current.cameraOperator.rotated = ccamOptions.rotated;
          if (ccamOptions.hFOV)
            worldRef.current.cameraOperator.hFOV = ccamOptions.hFOV;
          if (ccamOptions.distance_back)
            worldRef.current.cameraOperator.distance_back =
              ccamOptions.distance_back;
          // trigger a resize event to recalculate cameras
          worldRef.current.cameraOperator.onResize(
            canvasRef.current!.clientWidth,
            canvasRef.current!.clientHeight
          );
        }
      }
    }, [
      world,
      overlayActive,
      ccamOptions,
      ccamOptions.rotated,
      ccamOptions.render_frames,
      ccamOptions.distance_back,
      ccamOptions.hFOV,
    ]);

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
