import Button from "@/components/global/button";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import clsx from "clsx";

// A popup can use a default button a cover element where te onClick will display the pop up
interface PopUpProps extends React.HTMLAttributes<HTMLDivElement> {
   children?: React.ReactNode;
   cover?: React.ReactNode;
   buttonClassName?: string;
   icon?: IconProp;
   text?: string;
}

export default function PopUp(props: PopUpProps): JSX.Element {
   const [open, setOpen] = useState(false);

   return (
      <div
         className="relative"
         onClick = {(event) => {
            // Ensure the onClick does that propagate to parent component
            event.stopPropagation();
            setOpen(true)
         }}
      >
         {
            props.cover ?? (
               <Button
                  className = {props.buttonClassName}
                  icon = {props.icon}
               >
                  {props.text}
               </Button>
            )
         }
         {
            open && (
               <div className = {clsx("fixed w-full mx-auto inset-0 flex items-center justify-center align-center p-6 z-50", props.className)}>
                  <div className = "fixed inset-0 bg-gray-600 bg-opacity-50"></div>
                  <div className = "relative bg-white rounded-lg shadow-lg p-16 w-full max-h-[90%] overflow-y-auto">
                     <Button
                        className = "absolute top-3 right-3"
                        onClick = {(event) => {
                           // Ensure the onClick does that propagate to parent cover component
                           event.stopPropagation();
                           setOpen(false);
                        }}
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

