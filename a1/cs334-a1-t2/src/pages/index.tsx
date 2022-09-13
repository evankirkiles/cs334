import type { NextPage } from "next";
import Head from "next/head";
import NobotWorld from "../components/NobotWorld/NobotWorld";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>CS334 A1 - Nobots</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NobotWorld world={"ccamdisplay"} windowsStart={1} windowsEnd={6} />
    </div>
  );
};

export default Home;
