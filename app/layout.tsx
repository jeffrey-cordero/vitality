"use client";
import "./global.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import cx from "classnames";
import Head from "next/head";
import Footer from "@/components/global/footer";
import { sfPro, inter } from "./fonts";
import { SideBar } from "@/components/global/sidebar";
import { createContext, SetStateAction, useEffect, useState } from "react";
import { users as User } from "@prisma/client";
import { getAuthentication } from "@/lib/authentication/user";

interface AuthenticationContextType {
   user: User | undefined;
   // eslint-disable-next-line no-unused-vars
   updateUser: (user: SetStateAction<User | undefined>) => void;
}

export const AuthenticationContext = createContext<AuthenticationContextType>({
   user: undefined,
   updateUser: () => {}
});

export default function Layout({
   children
}: {
  children: React.ReactNode;
}) {
   const [user, setUser] = useState<User | undefined>(undefined);

   const updateUser = (user: SetStateAction<User | undefined>) => {
      setUser(user);
   };

   const handleAuthentication = async() => {
      try {
         const context = await getAuthentication();
         setUser(context);
      } catch (error) {
         console.error("Failed to fetch authentication:", error);
      }
   };

   useEffect(() => {
      handleAuthentication();
   }, []);

   return (
      <html lang = "en" className = "m-0 p-0 overflow-x-hidden w-full ">
         <Head>
            <title>Vitality</title>
            <meta name = "description" content = "A modern fitness tracker to fuel your fitness goals" />
            <meta name = "author" content = "Jeffrey Cordero" />
            <meta name = "keywords" content = "fitness, tracker, health, wellness, vitality" />
            <meta name = "robots" content = "index, follow" />
            <link rel = "icon" href = "favcon.ico" />
            <meta name = "viewport" content = "width=device-width, initial-scale=1.0" />

         </Head>
         <body className = {cx(sfPro.variable, inter.variable, "box-border m-0 p-0  overflow-x-hidden w-full max-w-screen min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 text-black")}>
            <AuthenticationContext.Provider value = {{ user, updateUser }}>
               <SideBar />
               <div>
                  {children}
               </div>
               <Footer />
            </AuthenticationContext.Provider>
         </body>
      </html>
   );
}