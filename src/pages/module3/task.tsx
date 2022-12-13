import type { NextPage } from "next";
import Head from "next/head";
import s from "../../styles/Module1.module.scss";
import YouTube from "react-youtube";
import { HiOutlineExternalLink } from "react-icons/hi";
import Image from "next/image";
import SocketControllerDisplay from "../../components/module2/SocketControllerDisplay/SocketControllerDisplay";
import PerfectRed from "../../../public/img/perfectred.jpeg";

const WEBSOCKET_URL = "ws://localhost:3000/";

const Module1HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>CS334 M3T1 - Perfect Red</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={s.control_container} style={{ textAlign: "center" }}>
        <h1 className={s.header}>Task 1</h1>
        <h3 className={s.subtitle}>M3: Installation Art</h3>
        <div className={s.row}>
          <div className={s.row_item}>by evan kirkiles</div>
          <div className={s.row_item}>Nov 1, 2022</div>
        </div>
        <div className={s.text}>
          “perfect red” takes two empty packs of marlboro red cigarettes and
          repurposes what is typically junk into its own method of archival: a
          small digital camera and remote control unit, allowing image capture
          and flash activation through web socket communication. captures are
          sent back to a server where they are saved for viewing on the web.
        </div>
        <div className={s.image_embedded}>
          <Image
            src={PerfectRed}
            layout={"responsive"}
            objectFit={"fill"}
            objectPosition={"center"}
            alt={"Perfect Red"}
          />
        </div>
        <div className={s.text}>
          the camera is a standalone system that receives commands over
          websockets from the aforementioned server. it has no pin out, so it is
          entirely made up of the ESP-CAM held in place inside of one of the
          marlboro red boxes, powered through serial.
        </div>
        <YouTube videoId="XugTbTfz5yU" className={s.youtubeContainer} />
      </div>
      <div className={s.control_container}>
        <div className={s.setup_text}>1. SETUP</div>
        <div className={s.text}>
          the code used in the project (flash both ESP-CAM and ESP32). then the
          system should work on boot.
        </div>
        <a
          className={s.remote_link}
          href="https://github.com/evankirkiles/cs334/tree/master/misc/module3/task1/ccamnote_esp32_camera"
          target="_blank"
          rel="noopener noreferrer"
        >
          ESP-CAM code
          <HiOutlineExternalLink />
        </a>
        <a
          className={s.remote_link}
          href="https://github.com/evankirkiles/cs334/tree/master/misc/module3/task1/ccamnote_esp32_controller"
          target="_blank"
          rel="noopener noreferrer"
        >
         ESP32 controller code
          <HiOutlineExternalLink />
        </a>
        <a
          className={s.remote_link}
          href="https://github.com/evankirkiles/cs334/tree/master/misc/module3/task1/ccamnote_ws_server"
          target="_blank"
          rel="noopener noreferrer"
        >
          webserver code
          <HiOutlineExternalLink />
        </a>
      </div>
      <div className={s.control_container}>
        {" "}
        <div className={s.setup_text}>2. CONTROLS</div>
        <div className={s.text}>
          touching the paperclip capacitative touch sensor turns on and off
          the flashlight of the RC camera. clicking the red button takes a 
          picture, which can then be viewed through the server.
        </div>
      </div>
    </>
  );
};

export default Module1HomePage;
