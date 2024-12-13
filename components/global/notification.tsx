"use client";
import clsx from "clsx";
import { useRef, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NotificationContext } from "@/app/layout";
import { faXmark, faCircleCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export interface NotificationProps extends React.HTMLAttributes<any> {
  status: "Initial" | "Success" | "Error" | "Failure";
  message: string;
  children?: React.ReactNode;
  timer?: number;
}

export default function Notification(props: NotificationProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { status, message, children, timer } = props;
   const icon = status === "Success" ? faCircleCheck : faTriangleExclamation;
   const notificationRef = useRef<HTMLDivElement>(null);

   const removeNotification = () => {
      // Add a fading out animation and eventually remove from the DOM
      notificationRef.current?.classList.add("animate-fadeOut");

      setTimeout(() => {
         updateNotification({
            status: "Initial",
            message: ""
         });
      }, 1250);
   };

   // If timer is provided, remove after the desired time limit
   if (timer !== undefined) {
      setTimeout(() => {
         removeNotification();
      }, timer);
   }

   return (
      <>
         {
            <div
               id = "notification"
               className = "fixed left-1/2 top-0 z-50 mx-auto mt-4 min-h-[4.5rem] w-[30rem] max-w-[95%] -translate-x-1/2 animate-fadeIn opacity-0"
               { ...props }
               ref = { notificationRef }
            >
               <div className = "text-left">
                  <div
                     className = {
                        clsx(
                           "flex w-full items-center rounded-lg border-l-8 bg-white pl-4 dark:bg-slate-800",
                           {
                              "border-l-green-600": status === "Success",
                              "border-l-red-600": status !== "Success"
                           },
                        )
                     }
                  >
                     <div className = "flex items-center justify-center rounded-full">
                        <FontAwesomeIcon
                           icon = { icon }
                           className = {
                              clsx("text-3xl", {
                                 "text-green-600": status === "Success",
                                 "text-red-600": status !== "Success"
                              })
                           }
                        />
                     </div>
                     <div className = "flex w-full items-center justify-between px-4 pb-3 pt-[16px]">
                        <div>
                           <div className = "my-2 flex flex-col gap-2 whitespace-pre-wrap break-words pl-1 pr-6 text-[0.95rem] font-bold xsm:text-base">
                              <p>{ message }</p>
                              { children }
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className = "absolute right-[-2px] top-[-5px] z-50 rounded-e-md p-3.5">
                  <FontAwesomeIcon
                     icon = { faXmark }
                     className = "size-4 shrink-0 cursor-pointer text-xl font-bold text-red-500"
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