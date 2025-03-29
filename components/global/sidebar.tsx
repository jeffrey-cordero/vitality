"use client";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faAnglesRight, faBars, faComments, faDoorOpen, faDumbbell, faGears, faHome, faMoon, faPlaneArrival, faRightFromBracket, faSun, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import { AuthenticationContext } from "@/app/layout";
import { endSession } from "@/lib/authentication/session";

interface SideBarProps {
  name: string;
  href: string;
  icon: IconDefinition;
}

const landingLinks: SideBarProps[] = [
   { name: "Landing", href: "/", icon: faPlaneArrival },
   { name: "Log In", href: "/login", icon: faDoorOpen },
   { name: "Sign Up", href: "/signup", icon: faUserPlus },
   { name: "Theme", href: "\0", icon: null }
];

const homeLinks: SideBarProps[] = [
   { name: "Home", href: "/home", icon: faHome },
   { name: "Workouts", href: "/home/workouts", icon: faDumbbell },
   { name: "Feedback", href: "/home/feedback", icon: faComments },
   { name: "Settings", href: "/home/settings", icon: faGears },
   { name: "Theme", href: "\0", icon: null },
   { name: "Sign Out", href: "\0", icon: faRightFromBracket }
];

function SideBarLinks(): JSX.Element {
   const { user, theme, updateTheme, fetched } = useContext(AuthenticationContext);
   const [links, setLinks] = useState<SideBarProps[]>(homeLinks);
   const pathname = usePathname();

   // Update sidebar links based on current user presence
   useEffect(() => {
      fetched && setLinks(user === undefined ? landingLinks : homeLinks);
   }, [
      user,
      links,
      fetched
   ]);

   return (
      <>
         {
            links.map((link) => {
               const isTheme: boolean = link.name === "Theme";
               const isSignOut: boolean = link.name === "Sign Out";

               return (
                  <Link
                     key = { link.name }
                     href = { link.href }
                     className = {
                        clsx(
                           "z-40 flex h-[50px] w-full items-center justify-center rounded-md text-sm font-semibold hover:text-primary",
                           {
                              "bg-sky-100 dark:bg-slate-700 text-primary": pathname === link.href,
                              "hover:text-yellow-400": isTheme,
                              "text-red-500 hover:text-red-600": isSignOut
                           },
                        )
                     }
                     onClick = {
                        async(event) => {
                           switch (link.name) {
                              case "Sign Out":
                                 event.preventDefault();
                                 await endSession();
                                 window.location.reload();
                                 break;
                              case "Theme":
                                 event.preventDefault();
                                 updateTheme(theme === "dark" ? "light" : "dark");
                                 break;
                              default:
                                 return;
                           }
                        }
                     }
                  >
                     <FontAwesomeIcon
                        icon = { isTheme ? theme === "dark" ? faMoon : faSun : link.icon }
                        className = {
                           clsx("text-[1.6rem]", {
                              "text-yellow-400 hover:text-yellow-500": isTheme
                           })
                        }
                     />
                  </Link>
               );
            })
         }
      </>
   );
}

export function SideBar(): JSX.Element {
   // Sidebar visibility state is stored in local storage for persistence
   const [visibleSideBar, setVisibleSideBar] = useState<boolean>(window.localStorage.getItem("visibleSideBar") === "true");

   useEffect(() => {
      window.localStorage.setItem("visibleSideBar", visibleSideBar.toString());
   }, [visibleSideBar]);

   return (
      <div className = "relative">
         <div className = "absolute left-0 top-0 z-30">
            <div className = "relative left-0 top-0 z-30 translate-x-[10px] translate-y-[15px]">
               <FontAwesomeIcon
                  id = "sideBarButton"
                  icon = { visibleSideBar ? faAnglesRight : faBars }
                  className = "text-[1.6rem] font-extrabold text-black hover:cursor-pointer dark:text-white"
                  onClick = {
                     () => {
                        setVisibleSideBar(!visibleSideBar);
                     }
                  }
               />
            </div>
         </div>
         <div className = "absolute z-20">
            <div
               id = "sideBarLinks"
               className = {
                  clsx(
                     "group relative top-[-15px] m-0 w-20 transition-all duration-1000 ease-in-out",
                     {
                        "left-[-6.5rem]": !visibleSideBar,
                        "left-[10px]": visibleSideBar
                     },
                  )
               }
            >
               <div className = "mt-20 flex h-auto flex-col overflow-hidden rounded-2xl bg-gray-50 px-3 py-4 shadow-lg dark:bg-slate-800 dark:shadow-xl dark:shadow-slate-950">
                  <div className = "flex flex-col justify-center space-x-2 space-y-2 text-center">
                     <div className = "flex size-full flex-col items-center justify-between text-center">
                        <SideBarLinks />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}