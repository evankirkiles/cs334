import type { NextPage } from "next";
import Head from "next/head";
import s from "../../styles/Module1.module.scss";
import YouTube from "react-youtube";
import { HiOutlineExternalLink } from "react-icons/hi";
import Image from "next/image";
import SocketControllerDisplay from "../../components/module2/SocketControllerDisplay/SocketControllerDisplay";
import LloidPapercraft from "../../../public/img/lloidpapercraft.jpeg";

const Module1HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>CS334 M4T1 - Lloid Papercraft</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={s.control_container} style={{ textAlign: "center" }}>
        <h1 className={s.header}>Task 1</h1>
        <h3 className={s.subtitle}>M4: Kinetic Sculpture</h3>
        <div className={s.row}>
          <div className={s.row_item}>by evan kirkiles</div>
          <div className={s.row_item}>Nov 15, 2022</div>
        </div>
        <div className={s.text}>
          frank lloid wright is my little stone lloid friend who i built out of
          paper and two F90S continuous rotation servos. he likes to dance––in
          fact, that is all he can do, and does so immediately upon receiving
          power through his nether regions. he comes with a little controller so
          that power is determined by a switch instead of plugging into an
          outlet again and again. he is less a grand demonstration of the
          capabilities of servos than a creative expression of the possibilities
          and personality a well-designed enclosure can give to what is really a
          quite simple machine.
        </div>
        <div className={s.image_embedded}>
          <Image
            src={LloidPapercraft}
            layout={"responsive"}
            objectFit={"fill"}
            objectPosition={"center"}
            alt={"Lloid kinetic papercraft"}
          />
        </div>
        <div className={s.text}>
          the papercraft itself was designed using Pepakura, with the servos
          beind held with drywall inside of the body. the circuits themselves
          are all stuffed inside of a cigarette box powered by a buck converter
          stepping down power from a 12V wall plug to 5V and 3.3V to power the
          servos and ESP32, respectively.
        </div>
        <YouTube videoId="3QzoD3pa9vQ" className={s.youtubeContainer} />
      </div>
      <div className={s.control_container}>
        <div className={s.setup_text}>1. SETUP</div>
        <div className={s.text}>
          the code used for the ESP that managed the servo motors can be found below,
          as well as the template with which you can build your own lloid.
        </div>
        <a
          className={s.remote_link}
          href="https://github.com/evankirkiles/cs334/tree/master/misc/module4/task2/franklloidwright"
          target="_blank"
          rel="noopener noreferrer"
        >
          ESP32 code
          <HiOutlineExternalLink />
        </a>
        <a
          className={s.remote_link}
          href="https://github.com/evankirkiles/cs334/tree/master/misc/module4/task2/lloid.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Lloid papercraft
          <HiOutlineExternalLink />
        </a>
      </div>
      <div className={s.control_container}>
        {" "}
        <div className={s.setup_text}>2. CONTROLS</div>
        <div className={s.text}>
          the mini sculpture works immediately once you plug it in and
          flip the switch.
        </div>
      </div>
    </>
  );
};

export default Module1HomePage;
