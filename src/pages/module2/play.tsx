import type { NextPage } from "next";
import Head from "next/head";
import NobotWorld from "../../components/module2/NobotWorld";
import styles from "../../styles/Home.module.scss";

const Module2PlayPage: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>PLAY // CS334 Module 2 - @evankirkiles</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NobotWorld world={"/assets/worlds/room.glb"} />
    </div>
  );
};

(Module2PlayPage as any).getLayout = (page: React.ReactNode) => page;

export default Module2PlayPage;
