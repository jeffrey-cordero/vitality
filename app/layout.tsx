"use client";
import "./global.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import cx from "classnames";
import Head from "next/head";
import Footer from "@/components/global/footer";
import Notification from "@/components/global/notification";
import { sfPro, inter } from "./fonts";
import { SideBar } from "@/components/global/sidebar";
import { createContext, SetStateAction, useEffect, useState } from "react";
import { users as User } from "@prisma/client";
import { getAuthentication } from "@/lib/authentication/user";
import { NotificationProps } from "@/components/global/notification";

interface AuthenticationContextType {
   user: User | undefined;
   // eslint-disable-next-line no-unused-vars
   updateUser: (user: SetStateAction<User | undefined>) => void;
}

interface NotificationContextType {
   notification: NotificationProps | undefined;
   // eslint-disable-next-line no-unused-vars
   updateNotification: (notification: NotificationProps) => void;
}

export const AuthenticationContext = createContext<AuthenticationContextType>({
   user: undefined,
   updateUser: () => {}
});

export const NotificationContext = createContext<NotificationContextType>({
   notification: {
      children: null,
      status: "Initial",
      message: ""
   },
   updateNotification: () => {}
});

export default function Layout({
   children
}: {
   children: React.ReactNode;
}) {
   // Layouts holds context for both user and potential notifications
   const [user, setUser] = useState<User | undefined>(undefined);
   const [notification, setNotification] = useState<NotificationProps | undefined>(undefined);

   const updateUser = (user: SetStateAction<User | undefined>) => {
      setUser(user);
   };

   const handleAuthentication = async() => {
      try {
         const user = await getAuthentication();
         setUser(user);
      } catch (error) {
         setUser(undefined);
      }
   };

   const updateNotification = (notification: NotificationProps) => {
      setNotification(notification);
   };

   useEffect(() => {
      handleAuthentication();
   }, []);

   return (
      <html lang = "en" className = "m-0 p-0 overflow-x-hidden w-full">
         <Head>
            <title>Vitality</title>
            <meta name = "description" content = "A modern fitness tracker to fuel your fitness goals" />
            <meta name = "author" content = "Jeffrey Cordero" />
            <meta name = "keywords" content = "fitness, tracker, health, wellness, vitality" />
            <meta name = "robots" content = "index, follow" />
            <link rel = "icon" href = "favcon.ico" />
            <meta name = "viewport" content = "width=device-width, initial-scale=1.0" />
         </Head>
         <body
            className = {cx(sfPro.variable, inter.variable, "box-border m-0 p-0  overflow-x-hidden w-full max-w-screen min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 text-black")}
            suppressHydrationWarning = {true}>
            <AuthenticationContext.Provider value = {{ user, updateUser }}>
               <SideBar />
               <NotificationContext.Provider value = {{ notification, updateNotification }}>
                  <div>
                     {children}
                  </div>
                  <div>
                     { notification !== undefined && notification.status !== "Initial" && (
                        <Notification {...notification} />
                     )
                     }
                  </div>
               </NotificationContext.Provider>
               <Footer />
            </AuthenticationContext.Provider>
         </body>
      </html>
   );
}