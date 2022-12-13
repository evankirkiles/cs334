import type { NextPage } from "next";
import Head from "next/head";
import { createRef, RefObject, useEffect, useRef, useState } from "react";
import NobotWorld from "../../components/module2/NobotWorld";
import { CSSTransition } from "react-transition-group";
import { saveAs } from "file-saver";
import styles from "../../styles/Module1T1.module.scss";
import Window, { WindowHandle } from "../../components/module1/Window/Window";

const Module1LayoutPage: NextPage = () => {
  const [upRight, setUpright] = useState<number>(0);

  // transition stuff
  const transitionRef = useRef<HTMLDivElement>(null);
  const [transitionIn, setTransitionIn] = useState(false);

  // map refs to
  const [nWindows, setNWindows] = useState<number>(3);
  const [windowRefs, setWindowRefs] = useState<RefObject<WindowHandle>[]>([]);
  useEffect(() => {
    setWindowRefs((windowRefs) =>
      Array(nWindows)
        .fill(undefined)
        .map((_, i) => windowRefs[i] || createRef<WindowHandle>())
    );
  }, [nWindows]);

  // add key listeners to window
  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      // on space bar press, copy the window infos to clipboard
      if (e.key === " ") {
        const dimsString = windowRefs
          .reduce<string[]>((acc, ref) => {
            if (!ref.current) return acc;
            const info = ref.current.getInfo();
            acc.push(
              `[${info.displayLabel}] POS: (${info.position.x.toFixed(0)}px, ${info.position.y.toFixed(0)}px) DIMS: (${info.dimensions.width.toFixed(0)}px, ${info.dimensions.height.toFixed(0)}px)`
            );
            return acc;
          }, [])
          .join("\n");
        const { width, height } = document.body.getBoundingClientRect();
        const finalString = `WINDOW: ${width.toFixed(0)}px wide by ${height.toFixed(0)}px tall\n${dimsString}`;
        navigator.clipboard.writeText(finalString);
        // download file
        DomToImage.toBlob(document.body).then(function (blob) {
          saveAs(blob, `cs334displays.png`);
          setTransitionIn(true);
        });
      }

      // on any number press, make that number of columns.
      else if (/^[0-9]$/i.test(e.key)) {
        setNWindows(parseInt(e.key));
      }
    };

    window.addEventListener("keypress", keyListener, false);
    return () => window.removeEventListener("keypress", keyListener, false);
  }, [windowRefs]);

  // window width. need to use an effect b/c of SSR
  const [windowUnit, setWindowUnit] = useState(400);
  const [windowHeight, setWindowHeight] = useState(400);
  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    setWindowUnit(innerWidth / nWindows);
    setWindowHeight(innerHeight);
  }, [nWindows])
  return (
    <div className={styles.container}>
      <Head>
        <title>LAYOUT // CS334 Module 1 - @evankirkiles</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {windowRefs.map((ref, i) => (
          <Window
            key={i}
            ref={ref}
            defaultPosition={{ x: windowUnit * i, y: 0}}
            defaultDimensions={{ width: windowUnit, height: windowHeight }}
            displaylabel={(i + 1).toString()}
            upRight={upRight}
            setUpright={setUpright}
          />
        ))}
        <CSSTransition
          in={transitionIn}
          timeout={300}
          onEntered={() => setTransitionIn(false)}
          nodeRef={transitionRef}
        >
          <div className={styles.backdrop} ref={transitionRef}></div>
        </CSSTransition>
      </main>
    </div>
  );
};

(Module1LayoutPage as any).getLayout = (page: React.ReactNode) => page;

export default Module1LayoutPage;
