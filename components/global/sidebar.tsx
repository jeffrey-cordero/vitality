"use client";
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faBars, faAnglesRight, faPlaneArrival, faUserPlus, faDoorOpen, faHouse, faPersonRunning, faUtensils, faBrain, faHeartCircleBolt, faBullseye, faShuffle, faPeopleGroup, faHandshakeAngle, faGears } from "@fortawesome/free-solid-svg-icons";

interface SideBarProps {
   name: string;
   href: string;
   icon: IconDefinition
}

const landingLinks: SideBarProps[] = [
   { name: "Landing", href: "/", icon: faPlaneArrival },
   { name: "Log In", href: "/login", icon: faDoorOpen },
   { name: "Sign Up", href: "/signup", icon: faUserPlus }
];

const userLinks: SideBarProps[] = [
   { name: "Home", href: "/home", icon: faHouse },
   { name: "Workouts", href: "/home/workouts", icon: faPersonRunning },
   { name: "Nutrition", href: "/home/nutrition", icon: faUtensils },
   { name: "Mood", href: "/home/mood", icon: faBrain },
   { name: "Health", href: "/home/health", icon: faHeartCircleBolt },
   { name: "Goals", href: "/home/goals", icon: faBullseye },
   { name: "Progress", href: "/home/progress", icon: faShuffle },
   { name: "Community", href: "/home/community", icon: faPeopleGroup },
   { name: "Support", href: "/home/support", icon: faHandshakeAngle },
   { name: "Settings", href: "/home/settings", icon: faGears }
];

function SideBarLinks (): JSX.Element {
   const pathname = usePathname();
   const links = pathname.startsWith("/home") ? userLinks : landingLinks;

   return (
      <>
         {links.map((link) => {
            return (
               <Link
                  key = {link.name}
                  href = {link.href}
                  className = {clsx(
                     "flex h-[50px] w-full items-center justify-start gap-10 rounded-md text-black bg-gray-50 pl-[10px] text-sm font-medium hover:text-blue-600",
                     {
                        "bg-sky-100 text-blue-600": pathname === link.href
                     },
                  )}
               >
                  <FontAwesomeIcon icon = {link.icon} className = "text-2xl" />
                  <p className = "whitespace-nowrap">{link.name}</p>
               </Link>
            );
         })}
      </>
   );
}

export default function SideBar (): JSX.Element {
   const [visibleSideBar, setVisibleSideBar] = useState<boolean>(false);

   return (
      <div className = "fixed z-10">
         <div className = "relative top-0 left-0 translate-x-[20px] translate-y-[1rem] pt-6 ml-[0.3rem] z-10">
            <FontAwesomeIcon
               icon = {visibleSideBar ? faAnglesRight : faBars}
               className = "text-3xl hover:cursor-pointer hover:shadow-sm hover:scale-[1.15] transition duration-300 ease-in-out"
               onClick = {() => {
                  setVisibleSideBar(!(visibleSideBar));
               }}
            />
         </div>
         <div className = {clsx("relative m-0 top-[-40px] w-[4.5rem] hover:w-64 transition-all duration-1000 ease-in-out", {
            "left-[-5rem]": !(visibleSideBar),
            "left-[10px]": visibleSideBar
         })}>
            <div className = "flex h-auto mt-20 flex-col px-3 py-4 bg-gray-50 shadow-md rounded-2xl overflow-hidden">
               <div className = "flex flex-col space-x-2 space-y-2 justify-center text-center">
                  <div className = "flex flex-col w-full h-full items-center justify-between text-center">
                     <SideBarLinks />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}