// Import Font Awesome CSS
import "./global.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import cx from "classnames";
import Head from "next/head";
import SideBar from "@/components/global/sidebar";

import { sfPro, inter } from "./fonts";
import { Metadata } from "next";

export const metadata: Metadata = {
   title: {
      template: "%s | Vitality",
      default: "Vitality"
   },
   description: "A modern fitness tracker to fuel your fitness goals",
   metadataBase: new URL("https://github.com/jeffrey-asm/vitality")
};


export default function Layout ({
   children
}: {
  children: React.ReactNode;
}) {
   return (
      <html lang = "en">
         <Head>
            <meta name = "viewport" content = "width=device-width, initial-scale=1.0" />
         </Head>
         <body className = {cx(sfPro.variable, inter.variable, "w-screen h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 text-black overflow-x-hidden min-h-screen")}>
            <SideBar />
            {children}
         </body>
      </html>
   );
}