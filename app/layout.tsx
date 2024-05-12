import "./global.css";
import Header from "@/components/global/header";
import cx from "classnames";
import { sfPro, inter } from "./fonts";

// Metadata
import { Metadata } from "next";

// Import Font Awesome CSS
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

export const metadata: Metadata = {
   title: {
      template: "%s | Vitality",
      default: "Vitality",
   },
   description: "A modern fitness tracker to fuel your fitness goals",
   metadataBase: new URL("https://github.com/jeffrey-asm/vitality"),
};


export default function RootLayout ({
   children,
}: {
  children: React.ReactNode;
}) {
   return (
      <html lang = "en">
         <body className = {cx(sfPro.variable, inter.variable, "bg-gradient-to-r from-indigo-50 via-white to-indigo-50 text-black overflow-x-hidden")}>
            <Header />
            {children}
         </body>
      </html>
   );
}
