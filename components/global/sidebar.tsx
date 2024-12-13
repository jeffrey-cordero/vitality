"use client";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { AuthenticationContext } from "@/app/layout";
import { useContext, useEffect, useState } from "react";
import { endSession } from "@/lib/authentication/session";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faAnglesRight, faPlaneArrival, faUserPlus, faDoorOpen, faHouse, faUtensils, faBrain, faHeartCircleBolt, faBullseye, faShuffle, faPeopleGroup, faHandshakeAngle, faGears, faBars, faDumbbell, faRightFromBracket, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

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
   { name: "Home", href: "/home", icon: faHouse },
   { name: "Workouts", href: "/home/workouts", icon: faDumbbell },
   { name: "Nutrition", href: "/home/nutrition", icon: faUtensils },
   { name: "Mood", href: "/home/mood", icon: faBrain },
   { name: "Health", href: "/home/health", icon: faHeartCircleBolt },
   { name: "Goals", href: "/home/goals", icon: faBullseye },
   { name: "Progress", href: "/home/progress", icon: faShuffle },
   { name: "Community", href: "/home/community", icon: faPeopleGroup },
   { name: "Support", href: "/home/support", icon: faHandshakeAngle },
   { name: "Settings", href: "/home/settings", icon: faGears },
   { name: "Theme", href: "\0", icon: null },
   { name: "Sign Out", href: "\0", icon: faRightFromBracket }
];

function SideBarLinks(): JSX.Element {
   const { user, theme, updateTheme, fetched } = useContext(AuthenticationContext);
   // Initialize links based on localStorage or pathname
   const [links, setLinks] = useState<SideBarProps[]>(homeLinks);
   const pathname = usePathname();

   // Update links based on user state and store in localStorage on unmount
   useEffect(() => {
      // Determine the new links based on user presence
      const newLinks = user === undefined ? landingLinks : homeLinks;

      if (fetched) {
         setLinks(newLinks);
      }
   }, [
      user,
      fetched,
      links
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
                           "z-40 flex h-[50px] w-full items-center justify-start gap-10 rounded-md text-sm font-semibold hover:text-primary",
                           {
                              "bg-sky-100 dark:bg-slate-700 text-primary": pathname === link.href,
                              "hover:text-yellow-400": isTheme,
                              "hover:text-red-500": isSignOut
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
                     <div className = "w-[30px] pl-[10px]">
                        <FontAwesomeIcon
                           icon = { isTheme ? theme === "dark" ? faMoon : faSun : link.icon }
                           className = {
                              clsx("text-2xl", {
                                 "text-yellow-400": isTheme
                              })
                           }
                        />
                     </div>
                     <p className = "whitespace-nowrap capitalize">
                        { isTheme ? theme : link.name }
                     </p>
                  </Link>
               );
            })
         }
      </>
   );
}

export function SideBar(): JSX.Element {
   const [visibleSideBar, setVisibleSideBar] = useState<boolean>(false);

   return (
      <div>
         <div className = "absolute left-0 top-0 z-30">
            <div className = "relative left-0 top-0 z-30 translate-x-[10px] translate-y-[15px]">
               <FontAwesomeIcon
                  id = "sideBarButton"
                  icon = { visibleSideBar ? faAnglesRight : faBars }
                  className = "text-3xl font-extrabold text-black hover:cursor-pointer dark:text-white"
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
                     "relative top-[-15px] m-0 w-[4.5rem] transition-all duration-1000 ease-in-out xsm:hover:w-60 xsm:focus:w-60",
                     {
                        "left-[-5rem]": !visibleSideBar,
                        "left-[10px]": visibleSideBar
                     },
                  )
               }
            >
               <div
                  className = "mt-20 flex h-auto flex-col overflow-hidden rounded-2xl bg-gray-50 px-3 py-4 shadow-md dark:bg-slate-800"
                  onMouseEnter = {
                     () => {
                        setVisibleSideBar(true);
                     }
                  }
               >
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