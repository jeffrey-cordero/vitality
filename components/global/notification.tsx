"use client";
import { faBomb, faCircleCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useContext, useRef } from "react";

import { NotificationContext } from "@/app/layout";

export interface NotificationProps extends React.HTMLAttributes<any> {
  status: "Initial" | "Success" | "Error" | "Failure";
  message: string;
  children?: React.ReactNode;
  timer?: number;
}

export default function Notification(props: NotificationProps): JSX.Element {
   const { updateNotifications } = useContext(NotificationContext);
   const { status, message, children, timer } = props;
   const icon = status === "Success" ? faCircleCheck : faBomb;
   const notificationRef = useRef<HTMLDivElement>(null);

   const removeNotification = () => {
      // Fade-out animation for removing existing notification
      notificationRef.current?.classList.add("animate-fadeOut");

      // Remove current notification after the provided timer
      setTimeout(() => {
         notificationRef.current?.classList.remove("animate-fadeOut");

         updateNotifications({
            status: "Success",
            message: "remove"
         });
      }, 1250);
   };

   if (timer !== undefined) {
      // Start timer for removing notification after a set duration, if applicable
      setTimeout(() => {
         removeNotification();
      }, timer);
   }

   return (
      <>
         {
            <div
               ref = { notificationRef }
               id = "notification"
               className = "fixed left-1/2 top-0 z-50 mx-auto mt-4 min-h-[4.5rem] w-[30rem] max-w-[95%] -translate-x-1/2 animate-fadeIn opacity-0"
               { ...props }
            >
               <div className = "text-left">
                  <div
                     className = {
                        clsx(
                           "flex w-full items-center rounded-lg border-l-8 bg-white dark:bg-slate-800",
                           {
                              "border-l-green-500": status === "Success",
                              "border-l-red-500": status !== "Success"
                           },
                        )
                     }
                  >
                     <div className = "flex min-h-8 w-full items-center justify-start gap-4 p-4">
                        <div className = "flex items-center justify-center rounded-full">
                           <FontAwesomeIcon
                              icon = { icon }
                              className = {
                                 clsx("text-3xl", {
                                    "text-green-500": status === "Success",
                                    "text-red-500": status !== "Success"
                                 })
                              }
                           />
                        </div>
                        <div className = "relative">
                           <div className = "my-2 flex flex-col gap-2 pr-2 text-[0.95rem] font-bold [overflow-wrap:anywhere] xsm:text-base">
                              <p>{ message }</p>
                              { children }
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className = "absolute right-[-5px] top-[-10px] z-50 rounded-e-md p-3.5">
                  <FontAwesomeIcon
                     icon = { faXmark }
                     className = "cursor-pointer text-lg font-bold text-red-500"
                     fill = "black"
                     onClick = {
                        (event) => {
                           event.stopPropagation();
                           removeNotification();
                        }
                     }
                  />
               </div>
            </div>
         }
      </>
   );
}