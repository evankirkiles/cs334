/*
 * Window.tsx
 * author: evan kirkiles
 * created on Sat Sep 10 2022
 * 2022 the nobot space,
 */
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Rnd } from "react-rnd";
import s from "./Window.module.scss";

type WindowInfo = {
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  displayLabel: string;
};

type WindowProps = {
  displaylabel: string;
  defaultPosition: { x: number; y: number };
  defaultDimensions: { width: number; height: number };
  upRight: number;
  setUpright: (nur: number) => void;
};

export type WindowHandle = {
  getInfo: () => WindowInfo;
};

const Window: React.ForwardRefRenderFunction<WindowHandle, WindowProps> =
  function Window(
    { displaylabel, defaultPosition, defaultDimensions, upRight, setUpright },
    forwardedRef
  ) {
    const [displayLabel, setDisplayLabel] = useState(displaylabel);
    const [position, setPosition] = useState(defaultPosition);
    const [dimensions, setDimensions] = useState(defaultDimensions);

    // when the defaults change, we need to reset the position
    useEffect(() => {
      setPosition(defaultPosition);
      setDimensions(defaultDimensions);
    }, [defaultPosition, defaultDimensions]);

    // imperative handle for getting the position and dimensions
    useImperativeHandle(forwardedRef, () => ({
      getInfo: () => {
        return {
          position,
          dimensions,
          displayLabel,
        };
      },
    }));

    return (
      <Rnd
        className={s.window}
        size={{ width: dimensions.width, height: dimensions.height }}
        position={{ x: position.x, y: position.y }}
        onDragStop={(_, d) => setPosition({ x: d.x, y: d.y })}
        onResizeStop={(_, __, ref, ___, position) => {
          const { width, height } = ref.style;
          setDimensions({
            width: parseFloat(width),
            height: parseFloat(height),
          });
          setPosition(position);
        }}
        bounds={"body"}
      >
        <div className={s.inner_window}>
          <div className={s.s_border_label}>TOP</div>
          <div
            className={s.s_border_label}
            style={{
              top: "unset",
              left: "50%",
              bottom: "0px",
              transform: "translateX(-50%) scale(-1,-1",
            }}
          >
            BOTTOM
          </div>
          <div
            className={s.s_border_label}
            style={{
              left: "0px",
              top: "50%",
              transform: "translateY(-50%) scale(-1,-1)",
              writingMode: "vertical-lr",
            }}
          >
            LEFT
          </div>
          <div
            className={s.s_border_label}
            style={{
              left: "unset",
              right: "0px",
              top: "50%",
              transform: "translateY(-50%) scale(-1,-1)",
              writingMode: "vertical-lr",
            }}
          >
            RIGHT
          </div>
          <div
            className={s.info_container}
            style={{
              transform: `rotate(${90 * upRight}deg)`,
            }}
          >
            <span onClick={() => setUpright(upRight + 1)}>{displayLabel}</span>
            <div className={s.info_row}>
              POS: ({position.x.toFixed(0)}px, {position.y.toFixed(0)}px)
            </div>
            <div className={s.info_row}>
              DIMS: ({dimensions.width.toFixed(0)}px,{" "}
              {(dimensions.height).toFixed(0)}px)
            </div>
          </div>
        </div>
      </Rnd>
    );
  };

export default forwardRef(Window);
