import "./global.css";
import { sfPro, inter } from "./fonts";
import cx from "classnames";

// Metadata
import { Metadata } from "next";
// import Font Awesome CSS
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

export const metadata: Metadata = {
   title: {
      template: "%s | Vitality",
      default: "Vitality",
   },
   description: "TODO",
   metadataBase: new URL("https://www.google.com/"),
};


export default function RootLayout ({
   children,
}: {
  children: React.ReactNode;
}) {
   return (
      <html lang = "en">
         <body className = {cx(sfPro.variable, inter.variable, "bg-gradient-to-r from-indigo-50 via-white to-indigo-50 text-black overflow-x-hidden")}>
            {children}
         </body>
      </html>
   );
}
