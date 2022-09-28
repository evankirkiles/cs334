import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import s from "../../styles/Module1.module.scss";
import YouTube from "react-youtube";

const Module1HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>CS334 A1 - Nobots</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={s.control_container} style={{ textAlign: "center" }}>
        <h1 className={s.header}>Task 2</h1>
        <h3 className={s.subtitle}>M1: Generative Art</h3>
        <div className={s.row}>
          <div className={s.row_item}>by evan kirkiles</div>
          <div className={s.row_item}>Sep 20, 2022</div>
        </div>
        <div className={s.text} style={{ marginBottom: "10px" }}>
          a little scene in which nobots parade down York street outside the
          Leeds studio. click &quot;begin&quot; below to demo it in your
          browser, or watch the video for how it looks irl.
        </div>
        <YouTube videoId="8aYMk_561Dw" className={s.youtubeContainer} />
        <Link href="/module1/play">
          <a className={s.button} target="_blank" rel="noopener noreferrer">
            BEGIN
          </a>
        </Link>
      </div>
      <div className={s.control_container}>
        <div className={s.setup_text}>1. SETUP</div>
        <div className={s.text}>
          to get the project setup on the Leeds display, you first need to open
          two browser windows and fullscreen them in both triads of displays.
          this can be done easily by using:
        </div>
        <div className={s.control_row}>
          <div className={s.row_item}>CMD+SHIFT+RIGHT</div>
          <div className={s.row_control_descriptor}>
            - moves windows across desktops
          </div>
        </div>
        <div className={s.control_row}>
          <div className={s.row_item}>F11</div>
          <div className={s.row_control_descriptor}>
            - fullscreens windows in desktops
          </div>
        </div>
        <div className={s.text}>
          now, you have to set up the windows for rotated displays.
        </div>
      </div>
      <div className={s.control_container}>
        {" "}
        <div className={s.setup_text}>2. CONTROLS</div>
        <div className={s.text}>
          the controls for the tool are entirely keyboard-based, to allow for
          easier manipulation on the Leeds screens. they consist mostly of
          rotation and synchronization tools:
        </div>
        <div className={s.control_row}>
          <div className={s.row_item}>1</div>
          <div className={s.row_control_descriptor}>
            - display &quot;first&quot; three panes from right
          </div>
        </div>
        <div className={s.control_row}>
          <div className={s.row_item}>2</div>
          <div className={s.row_control_descriptor}>
            - display &quot;second&quot; three panes from right
          </div>
        </div>
        <div className={s.control_row}>
          <div className={s.row_item}>R</div>
          <div className={s.row_control_descriptor}>
            - rotate panes 90 degrees for Leeds displays
          </div>
        </div>
        <div className={s.text}>
          make sure that you&apos;ve actually clicked in a window before using
          any controls so that they key events are sent to the browser.
          you&apos;ll need to press 1 in the rightmost browser window, and 2 in
          the leftmost. as well as R in both to rotate the displays. then you
          should be good!
        </div>
      </div>
    </>
  );
};

export default Module1HomePage;
