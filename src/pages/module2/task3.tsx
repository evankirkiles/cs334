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
        <h1 className={s.header}>Task 3</h1>
        <h3 className={s.subtitle}>Interactive Modules</h3>
        <div className={s.row}>
          <div className={s.row_item}>by evan kirkiles</div>
          <div className={s.row_item}>Sep 27, 2022</div>
        </div>
        <div className={s.text} style={{ marginBottom: "10px" }}>
          the beginnings of an analog controller for controlling a web
          environment using web sockets. uses a joystick, button, and switch
          connected to the GPIO ports of a raspberry pi to take sensory input
          and send it through a websocket to a server, consumed by any web client also
          connected to the socket.
        </div>
      </div>
      <div className={s.control_container}>
        <div className={s.setup_text}>1. SETUP</div>
        <div className={s.text}>
          coming...
        </div>
      </div>
      <div className={s.control_container}>
        {" "}
        <div className={s.setup_text}>2. CONTROLS</div>
        <div className={s.text}>
          coming...
        </div>
      </div>
    </>
  );
};

export default Module1HomePage;
