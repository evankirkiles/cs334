import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import s from "../../styles/Module1.module.scss";
import YouTube from "react-youtube";
import Image from "next/image";
import LeedsDisplay from "../../../public/img/leeds_display.jpg";
import LeedsExport from "../../../public/img/leeds_export.png";
import { HiOutlineExternalLink } from "react-icons/hi";

const Module1HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>CS334 A1 - Nobots</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={s.control_container}>
        <h1 className={s.header}>Task 1</h1>
        <h3 className={s.subtitle}>M1: Generative Art</h3>
        <div className={s.row}>
          <div className={s.row_item}>by evan kirkiles</div>
          <div className={s.row_item}>Sep 14, 2022</div>
        </div>
        <div className={s.text}>
          <p>
            This is a program for dynamically measuring screen spaces. It&apos;s
            got some good defaults for the Leeds displays, but you&apos;ll see
            that you can use it for any similar digital-to-physical screen space
            mapping task. This program is written to be displayed full screen in
            a browser.
          </p>
        </div>
        <div className={s.image_embedded}>
          <Image
            src={LeedsDisplay}
            layout={"responsive"}
            objectFit={"fill"}
            objectPosition={"center"}
            alt={"Leeds display"}
          />
        </div>

<p>
    At the start, you&apos;re displayed three boxes, labeled with
    position coordinates (px), dimension coordinates (px), and a number
    indicating their order from left to right on the screen, with 1
    being the leftmost and 9 being the rightmost. To determine the pixel
    mapping of each box, the user should resize each box to match the
    physical screen space, then note the coordinates shown on the
    screen. Boxes can be translated by clicking and dragging within, and
    can be transformed by clicking and dragging on the edges.
  </p>
        <div className={s.image_embedded}>
          <Image
            src={LeedsExport}
            layout={"responsive"}
            objectFit={"fill"}
            objectPosition={"center"}
            alt={"Leeds display"}
          />
        </div>
        <Link href="/module1/layout">
          <a className={s.button} target="_blank" rel="noopener noreferrer">
            BEGIN
          </a>
        </Link>
        <a
          className={s.remote_link}
          href="https://github.com/evankirkiles/cs334.pi/tree/master/src/components/module1/Window"
          target="_blank"
          rel="noopener noreferrer"
        >
          web-based segmenting code
          <HiOutlineExternalLink />
        </a>
      </div>
      <div className={s.control_container}>
        <div className={s.setup_text}>1. SETUP</div>
        <div className={s.text}>
          to get the project setup on the Leeds display, simply open the window
          by clicking &lquot;begin&rquot; above and drag the window until it covers both 
          screens––or use two separate fullscreened windows.
        </div>
      </div>
      <div className={s.control_container}>
        {" "}
        <div className={s.setup_text}>2. CONTROLS</div>
        <div className={s.text}>
          the controls are quite easy, a mix between number inputs and mouse actions.
        </div>
        <div className={s.control_row}>
          <div className={s.row_item}>[0-9]</div>
          <div className={s.row_control_descriptor}>
            - change number of window segments
          </div>
        </div>
        <div className={s.control_row}>
          <div className={s.row_item}>Click</div>
          <div className={s.row_control_descriptor}>
            - rotate the numbers for easier reading
          </div>
        </div>
        <div className={s.control_row}>
          <div className={s.row_item}>Drag</div>
          <div className={s.row_control_descriptor}>
            - resize and move the window segments.
          </div>
        </div>
        <div className={s.text}>
          make sure that you&apos;ve actually clicked in a window before using
          any controls so that they key events are sent to the browser.
        </div>
      </div>
    </>
  );
};

export default Module1HomePage;
