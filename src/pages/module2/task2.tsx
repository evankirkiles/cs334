import type { NextPage } from "next";
import Head from "next/head";
import s from "../../styles/Module1.module.scss";
import YouTube from "react-youtube";
import { HiOutlineExternalLink } from "react-icons/hi";
import ESP32SocketControllerDisplay from "../../components/module2/ESP32SocketControllerDisplay/ESP32SocketControllerDisplay";
import Link from "next/link";

const WEBSOCKET_URL = "ws://96de-2601-18a-c681-c9a0-10a3-f75c-e629-7a61.ngrok.io/";

const Module2Task2Page: NextPage = () => {
  return (
    <>
      <Head>
        <title>CS334 M2T1 - Nobots</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={s.control_container} style={{ textAlign: "center" }}>
        <h1 className={s.header}>Task 2</h1>
        <h3 className={s.subtitle}>M2: Interactive Modules</h3>
        <div className={s.row}>
          <div className={s.row_item}>by evan kirkiles</div>
          <div className={s.row_item}>Sep 27, 2022</div>
        </div>
        <div className={s.text}>
          a finished version of the analog controller introduced in task 1,
          complete with a stylized robot enclosure and corresponding input
          funneling into a 3D browser game.
        </div>
        <div className={s.text}>
          before starting the game, make sure your controls work by testing
          on the interface below.
        </div>
        <ESP32SocketControllerDisplay url={WEBSOCKET_URL} />
        <div className={s.text}>
          the main differences between this task and the last are that this task&apos;s
          controller is entirely ESP32-based. we don&apos;t use a Pi, and therefore
          have improved size, costs, and on-boot functionality.
        </div>
        <YouTube videoId="wNNcLK44mmY" className={s.youtubeContainer} />
        <Link href="/module2/play">
          <a className={s.button} target="_blank" rel="noopener noreferrer">
            BEGIN GAME
          </a>
        </Link>
      </div>
      <div className={s.control_container}>
        <div className={s.setup_text}>1. SETUP</div>
        <div className={s.text}>
          first, download the websocket server on either your local machine or a
          remote server. run it with the commands{" "}
          <span className={s.code}>yarn install</span> and{" "}
          <span className={s.code}>yarn dev</span>. make note of the URI you can
          access the ws server publicly, or on your local network, from, e.g.{" "}
          <span className={s.code}>ws://localhost:3000/</span>.
        </div>
        <a
          className={s.remote_link}
          href="https://github.com/evankirkiles/cs334/tree/master/misc/module2/task2/nobot_ws_server"
          target="_blank"
          rel="noopener noreferrer"
        >
          websocket server code
          <HiOutlineExternalLink />
        </a>
        <div className={s.text}>
          download the websocket ESP-32 client and modify{" "}
          <span className={s.code}>include/sdkconfig.h</span> to reflect the websocket
          server&apos;s URI and your wifi credentials. build and flash it to your ESP32
          using the Espressif IDE extension for VSCode.
        </div>
        <a
          className={s.remote_link}
          href="https://github.com/evankirkiles/cs334/tree/master/misc/module2/task2/nobot_esp32_controller"
          target="_blank"
          rel="noopener noreferrer"
        >
          ESP32 client code
          <HiOutlineExternalLink />
        </a>
        <div className={s.text}>
          now, assuming you&apos;ve connected successfully to wifi (which you can check
          by viewing the serial output upon flashing the ESP32), you can listen
          to messages from the websocket server to get state
          updates from your controller! an example is live above, which you can
          view the code for below.
        </div>
        <a
          className={s.remote_link}
          href="https://github.com/evankirkiles/cs334/blob/master/src/components/module2/ESP32SocketControllerDisplay/ESP32SocketControllerDisplay.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          websocket consumer client code
          <HiOutlineExternalLink />
        </a>
      </div>
      <div className={s.control_container}>
        {" "}
        <div className={s.setup_text}>2. CONTROLS</div>
        <div className={s.text}>
          the joystick controls the movement of the character, while the button
          represents an &quot;action&quot; determined by the switch state. when
          the switch is <span className={s.code}>off</span>, i.e. pointed towards
          you, the button will cause the character to jump. when
          the switch is <span className={s.code}>on</span>, i.e. pointed away from
          you, the button will cause the character to interact, allowing you to 
          &quot;speak&quot; with the characters in the scene.
        </div>
      </div>
    </>
  );
};

export default Module2Task2Page;
