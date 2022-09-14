import type { NextPage } from "next";
import Head from "next/head";
import NobotWorld from "../../components/module1/NobotWorld/NobotWorld";
import styles from "../../styles/Home.module.scss";

const Module1PlayPage: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>PLAY // CS334 Module 1 - @evankirkiles</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NobotWorld
        world={"ccamdisplay_2"}
        render_frames={[1, 2, 3]}
        rotated={true}
      />
    </div>
  );
};

export default Module1PlayPage;
