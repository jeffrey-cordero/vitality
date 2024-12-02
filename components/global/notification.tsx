"use client";
import clsx from "clsx";
import { useRef, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NotificationContext } from "@/app/layout";
import { faCircleExclamation, faXmark, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export interface NotificationProps extends React.HTMLAttributes<any> {
  status: "Initial" | "Success" | "Error" | "Failure";
  message: string;
  children?: React.ReactNode;
  timer?: number;
}

export default function Notification(props: NotificationProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { status, message, children, timer } = props;
   const icon = status === "Success" ? faCircleCheck : faCircleExclamation;
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
               className = "fixed w-[30rem] max-w-[90%] min-h-[4.5rem] top-0 left-1/2 transform -translate-x-1/2 max-w-4/5 mx-auto mt-4 opacity-0 notification animate-fadeIn z-50"
               { ...props }
               ref = { notificationRef }>
               <div className = "text-left">
                  <div
                     className = {
                        clsx(
                           "w-full border-stroke flex items-center rounded-lg border-l-[8px] bg-white dark:bg-slate-800 pl-4",
                           {
                              "border-l-green-600": status === "Success",
                              "border-l-red-600": status !== "Success"
                           },
                        )
                     }>
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
                     <div className = "flex w-full items-center justify-between px-4 pt-[16px] pb-3">
                        <div>
                           <div className = "my-2 flex flex-col gap-2 font-bold pr-3 whitespace-pre-wrap break-all">
                              <p>{ message }</p>
                              { children }
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className = "absolute top-[-5px] right-[-5px] z-50 p-3.5 rounded-e-md">
                  <FontAwesomeIcon
                     icon = { faXmark }
                     className = "cursor-pointer flex-shrink-0 size-4.5 text-[19px] text-red-500 text-md font-extrabold"
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