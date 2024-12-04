"use client";
import "@/app/global.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import cx from "classnames";
import Footer from "@/components/global/footer";
import Notification from "@/components/global/notification";
import { sfPro, inter } from "@/app/fonts";
import { SideBar } from "@/components/global/sidebar";
import { createContext, useCallback, useEffect, useState } from "react";
import { getSession } from "@/lib/authentication/session";
import { NotificationProps } from "@/components/global/notification";
import { User as NextAuthUser } from "next-auth";

interface AuthenticationContextType {
   user: NextAuthUser | undefined;
   theme: "dark" | "light";
   updateTheme: (_theme: "dark" | "light") => void;
   fetched: boolean;
}

interface NotificationContextType {
   notification: NotificationProps | undefined;
   updateNotification: (_notification: NotificationProps) => void;
}

export const AuthenticationContext = createContext<AuthenticationContextType>({
   user: undefined,
   theme: null,
   updateTheme: () => {},
   fetched: false
});

export const NotificationContext = createContext<NotificationContextType>({
   notification: {
      children: null,
      status: "Initial",
      message: ""
   },
   updateNotification: (_notification: NotificationProps) => { }
});

export default function Layout({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<NextAuthUser | undefined>(undefined);
   const [theme, setTheme] = useState<"light" | "dark">(null);
   const [fetched, setFetched] = useState<boolean>(false);
   const [notification, setNotification] = useState<
      NotificationProps | undefined
   >(undefined);

   const handleAuthentication = useCallback(async() => {
      try {
         setUser(await getSession());
      } catch (error) {
         updateNotification({
            status: "Failure",
            message: error.message
         });

         setUser(undefined);
      }

      setFetched(true);
   }, []);

   const updateNotification = (notification: NotificationProps) => {
      setNotification(notification);
   };

   const updateTheme = (theme: "dark" | "light") => {
      window.localStorage.setItem("theme", theme);
      setTheme(theme);
   };

   useEffect(() => {
      if (!fetched) {
         setTheme(window.localStorage.theme === "dark" ||
            (!("theme" in window.localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
            ? "dark" : "light");
         handleAuthentication();
      }

      const handleModalClickAway = (event: MouseEvent) => {
         const modals = document.getElementsByClassName("modal");
         const notifications = document.getElementsByClassName("notification");
         const topMostModal =
            modals.length > 0
               ? (modals[modals.length - 1] as HTMLDivElement)
               : null;
         const target = event.target as HTMLElement;

         if (
            topMostModal &&
            !notifications[0]?.contains(target) &&
            !topMostModal.contains(target)
         ) {
            (
               topMostModal.getElementsByClassName("modal-close")[0] as SVGElement
            ).dispatchEvent(
               new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window
               }),
            );
         }
      };

      document.body.addEventListener("mousedown", handleModalClickAway);

      return () => {
         document.body.removeEventListener("mousedown", handleModalClickAway);
      };
   }, [
      fetched,
      handleAuthentication
   ]);

   return (
      <html
         lang = "en"
         className = { `m-0 w-full overflow-x-hidden p-0 ${theme === "dark" && "dark"}` }
         suppressHydrationWarning = { true }
      >
         <head>
            <title>Vitality</title>
            <link
               rel = "icon"
               type = "image/x-icon"
               href = "favicon.ico"
            ></link>
            <meta
               name = "description"
               content = "A modern fitness tracker to fuel your fitness goals"
            />
            <meta
               name = "author"
               content = "Jeffrey Cordero"
            />
            <meta
               name = "keywords"
               content = "fitness, tracker, health, wellness, vitality"
            />
            <meta
               name = "robots"
               content = "index, follow"
            />
            <link
               rel = "icon"
               href = "favcon.ico"
            />
            <meta
               name = "viewport"
               content = "width=device-width, initial-scale=1.0"
            />
         </head>
         <body
            className = {
               cx(
                  sfPro.variable,
                  inter.variable,
                  "box-border m-0 p-0 overflow-x-hidden max-w-screen min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 text-black dark:text-white",
               )
            }
         >
            {
               fetched && (
                  <AuthenticationContext.Provider value = { { user, theme, updateTheme, fetched } }>
                     <SideBar />
                     <NotificationContext.Provider
                        value = { { notification, updateNotification } }
                     >
                        <div>{ children }</div>
                        <div>
                           {
                              notification !== undefined && notification.status !== "Initial" && (
                                 <Notification { ...notification } />
                              )
                           }
                        </div>
                     </NotificationContext.Provider>
                     <Footer />
                  </AuthenticationContext.Provider>
               )
            }
         </body>
      </html>
   );
}