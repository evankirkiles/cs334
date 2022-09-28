import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.scss";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className={styles.title}>CS334</h1>
      <p className={styles.caption}>[creative embedded systems]</p>
      <p className={styles.caption}>2022 Fall Semester</p>
      <a
        href="https://evankirkiles.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <h2 className={styles.title2}>Evan Kirkiles</h2>
      </a>
      <h3 className={styles.subtitle}>Instructor: Scott Petersen</h3>
      <h3 className={styles.subtitle}>TF: Mike Winch</h3>
      <p className={styles.description}>
        Get started by clicking a module below. Each describes an assignment
        and the tasks completed within that module.
      </p>
      <div className={styles.grid}>
        <div className={styles.module_container}>
          <Link href="/module1">
            <a className={styles.card}>
              <h2>
                <span>1 &rarr;</span> <span>Generative art</span>
              </h2>
            </a>
          </Link>
          <div className={styles.task_row}>
            <a
              href="https://github.com/evankirkiles/cs334.a1"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.task_button_disabled}
            >
              Task 1
            </a>
            <Link href="/module1/task2">
              <div className={styles.task_button}>Task 2</div>
            </Link>
          </div>
        </div>
        <div className={styles.module_container}>
          <Link href="/module2">
            <a className={styles.card}>
              <h2>
                <span>2 &rarr;</span> <span>Interactive devices</span>
              </h2>
            </a>
          </Link>
          <div className={styles.task_row}>
            <Link href="/module2/task1">
              <div className={styles.task_button}>Task 1</div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
