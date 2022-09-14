import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import s from "../../styles/Home.module.scss";

const Module1HomePage: NextPage = () => {
  return (
    <div className={s.container}>
      <Head>
        <title>CS334 A1 - Nobots</title>
        <meta name="description" content="a nobot window display." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      evan&apos;s leeds display installation will go here.
      <Link href="/module1/play">
        click me.
      </Link>
    </div>
  );
};

export default Module1HomePage;
