"use client";
import clsx from "clsx";
import Main from "@/components/global/main";
import Form from "@/components/home/settings/form";
import Button from "@/components/global/button";
import { useContext } from "react";
import { endSession } from "@/lib/authentication/session";
import { AuthenticationContext } from "@/app/layout";
import { faMoon, faRightFromBracket, faSun } from "@fortawesome/free-solid-svg-icons";

export default function Page() {
   const { user } = useContext(AuthenticationContext);
   const { theme, updateTheme } = useContext(AuthenticationContext);

   console.log(user);

   return (
      <Main>
         <div className = "mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-2 text-center">
            <Button
               type = "button"
               className = {
                  clsx("flex h-[2.8rem] w-40 items-center justify-start gap-2 rounded-md bg-primary p-5 text-sm font-bold text-white md:flex-none", {
                     "bg-slate-700": theme === "dark",
                     "bg-primary text-white" : theme === "light"
                  })
               }
               icon = { theme === "dark" ? faMoon : faSun }
               styling = { theme === "dark" ? "text-sky-400" : "text-yellow-300" }
               onClick = {
                  () => {
                     updateTheme(theme === "dark" ? "light" : "dark");
                  }
               }
            >
               <p className = "capitalize">{ theme }</p>
            </Button>
            <Button
               type = "submit"
               className = "flex h-[2.8rem] w-40 items-center justify-start gap-2 rounded-md bg-red-500 p-5 text-sm font-bold text-white md:flex-none"
               icon = { faRightFromBracket }
               onClick = {
                  async() => {
                     await endSession();
                     window.location.reload();
                  }
               }
            >
               <p>Sign Out</p>
            </Button>
            <Form />
         </div>
      </Main>
   );
}