import type { NextPage } from "next";
import Head from "next/head";
import s from "../../styles/Module1.module.scss";
import YouTube from "react-youtube";
import { HiOutlineExternalLink } from "react-icons/hi";
import SocketControllerDisplay from "../../components/module2/SocketControllerDisplay/SocketControllerDisplay";

const WEBSOCKET_URL = "ws://localhost:3000/";

const Module1HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>CS334 M2T1 - Nobots</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={s.control_container} style={{ textAlign: "center" }}>
        <h1 className={s.header}>Task 1</h1>
        <h3 className={s.subtitle}>M2: Interactive Modules</h3>
        <div className={s.row}>
          <div className={s.row_item}>by evan kirkiles</div>
          <div className={s.row_item}>Sep 27, 2022</div>
        </div>
        <div className={s.text}>
          the beginnings of an analog controller for controlling a web
          environment using web sockets. uses a joystick, button, and switch
          connected to the GPIO ports of a raspberry pi to take sensory input
          and send it through a websocket to a server, consumed by any web
          client also connected to the socket.
        </div>
        <SocketControllerDisplay url={WEBSOCKET_URL} />
        <div className={s.text}>
          has the potential to support and display any number of GPIO sensors
          supplied, defined solely by the initial "state" message retrieved from
          the raspi controller's client code. this one uses a button, switch,
          and (analog-only) joystick, but we can remove any of those.
        </div>
        <YouTube videoId="21Y6QOtT9R0" className={s.youtubeContainer} />
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
        <div className={s.remote_link}>
          websocket server code
          <HiOutlineExternalLink />
        </div>
        <div className={s.text}>
          download the websocket pi client and modify{" "}
          <span className={s.code}>__main__.py</span> to reflect the websocket
          server's URI and your GPIO input sensors using the{" "}
          <span className={s.code}>input_types.py</span> input types.
        </div>
        <div className={s.remote_link}>
          websocket pi client code
          <HiOutlineExternalLink />
        </div>
        <div className={s.text}>
          now, you can listen to messages from the websocket server to get state
          updates from your controller! an example is live above, which you can
          view the code for.
        </div>
        <div className={s.remote_link}>
          websocket consumer client code
          <HiOutlineExternalLink />
        </div>
      </div>
      <div className={s.control_container}>
        {" "}
        <div className={s.setup_text}>2. CONTROLS</div>
        <div className={s.text}>
          the code supports any number of variations on the number and types of
          sensors you use, with the basic primitives being buttons, switches,
          and joysticks. it also has boilerplate for multiple controllers, which
          simply needs more advanced logic in the consumer.
        </div>
      </div>
    </>
  );
};

export default Module1HomePage;
