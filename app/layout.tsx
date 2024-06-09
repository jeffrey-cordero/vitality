import "./global.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import cx from "classnames";
import Head from "next/head";
import Footer from "@/components/global/footer";
import { sfPro, inter } from "./fonts";
import { Metadata } from "next";
import { SideBar } from "@/components/global/sidebar";

export const metadata: Metadata = {
   title: {
      template: "%s | Vitality",
      default: "Vitality"
   },
   description: "A modern fitness tracker to fuel your fitness goals",
   metadataBase: new URL("https://github.com/jeffrey-asm/vitality")
};


export default function Layout({
   children
}: {
  children: React.ReactNode;
}) {
   return (
      <html lang = "en" className = "m-0 p-0 overflow-x-hidden w-full ">
         <Head>
            <link rel = "icon" href = "favicon.ico" />
            <meta name = "viewport" content = "width=device-width, initial-scale=1.0" />
         </Head>
         <body className = {cx(sfPro.variable, inter.variable, "box-border m-0 p-0  overflow-x-hidden w-full max-w-screen min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 text-black")}>
            <SideBar />
            {children}
            <Footer />
         </body>
      </html>
   );
}