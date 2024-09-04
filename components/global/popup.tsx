import Button from "@/components/global/button";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import clsx from "clsx";

interface PopUpProps extends React.HTMLAttributes<HTMLDivElement> {
   children?: React.ReactNode;
   icon?: IconProp;
   buttonClassName?: string;
   text: string;
}

export default function PopUp(props: PopUpProps): JSX.Element {
   const [open, setOpen] = useState(false);

   return (
      <div className = "relative">
         <div>
            <Button
               className = {props.buttonClassName}
               onClick = {() => setOpen(true)}
               icon = {props.icon}
            >
               {props.text}
            </Button>
         </div>
         {
            open && (
               <div className = {clsx("fixed w-full mx-auto inset-0 flex items-center justify-center align-center p-6 z-50", props.className)}>
                  <div className = "fixed inset-0 bg-gray-600 bg-opacity-50"></div>
                  <div className = "relative bg-white rounded-lg shadow-lg p-16 w-full max-h-[90%] overflow-y-auto">
                     <Button
                        className = "absolute top-3 right-3"
                        onClick = {() => setOpen(false)}
                     >
                        <FontAwesomeIcon
                           icon = {faXmark}
                           className = "text-2xl text-red-500"
                        />
                     </Button>
                     {props.children}
                  </div>
               </div>
            )
         }
      </div>
   );
}

