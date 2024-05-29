import "./global.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import cx from "classnames";
import Head from "next/head";
import SideBar from "@/components/global/sidebar";
import Footer from "@/components/global/footer";
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
            <link rel = "icon" href = "favicon.ico" />
            <meta name = "viewport" content = "width=device-width, initial-scale=1.0" />
         </Head>
         <body className = {cx(sfPro.variable, inter.variable, "w-full max-w-screen min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 text-black overflow-x-hidden")}>
            <SideBar />
            {children}
            <Footer />
         </body>
      </html>
   );
}