import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import NobotWorld from "../../components/module1/NobotWorld/NobotWorld";
import styles from "../../styles/Home.module.scss";

const WINDOW_MAPPING = [[3, 2, 1], [6, 5, 4], [1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1]];

const Module1PlayPage: NextPage = () => {

  // keep track of which window we are showing
  const [currWindowTrio, setCurrWindowTrio] = useState<number>(0);
  const [rotated, setRotated] = useState<boolean>(false);

  // add key listeners to window
  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      // on space bar press, play the scene at the next minute mark. this is how
      // we will synchronize across screens.
      if (e.key === " ") {
        // TODO ...
      }

      // on any number press, make that number of columns.
      else if (/^[0-9]$/i.test(e.key)) {
        setCurrWindowTrio((parseInt(e.key) - 1) % WINDOW_MAPPING.length);
      }

      // on R pressed, rotate the screen
      else if (e.key === "r") {
        setRotated(!rotated);
      }
    };
    window.addEventListener("keypress", keyListener, false);
    return () => window.removeEventListener("keypress", keyListener, false);
  }, [rotated, setRotated, setCurrWindowTrio]);

  return (
    <div className={styles.container}>
      <Head>
        <title>PLAY // CS334 Module 1 - @evankirkiles</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NobotWorld
        world={"ccamdisplay_2"}
        render_frames={WINDOW_MAPPING[currWindowTrio]}
        rotated={rotated}
      />
    </div>
  );
};

export default Module1PlayPage;
