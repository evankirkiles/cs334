/*
 * Layout.tsx
 * author: evan kirkiles
 * created on Tue Sep 27 2022
 * 2022 the nobot space,
 */
import React from "react";
import s from "./Layout.module.scss";
import { AiFillHome } from "react-icons/ai";
import Link from "next/link";
import { useRouter } from "next/router";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = function Layout({ children }) {
  const router = useRouter();
  return (
    <>
      <div className={s.container}>
        <main className={s.main}>
          {/* <Cursor /> */}
          {children}
        </main>
        <div className={s.overlay} />
        <Link href="/">
          <div className={s.home_button}>
            <AiFillHome />
          </div>
        </Link>
      </div>
    </>
  );
};

export default Layout;
