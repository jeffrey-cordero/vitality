import clsx from "clsx";
import Button from "@/components/global/button";
import { forwardRef, useImperativeHandle, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

// A popup can use a default button or a cover element where the onClick will display the pop up
interface PopUpProps extends React.HTMLAttributes<HTMLDivElement> {
   children?: React.ReactNode;
   cover?: React.ReactNode;
   buttonClassName?: string;
   icon?: IconProp;
   text?: string;
   onClose?: () => void;
}

export const PopUp = forwardRef(function PopUp(props: PopUpProps, ref) {
   const [open, setOpen] = useState<boolean>(false);

   const onClose = () => {
      // Call user-defined pop-up close methods for cleanup
      props.onClose?.call(null);
      // Close the PopUp from current or parent component
      setOpen(false);
   };

   useImperativeHandle(ref, () => ({
      close: onClose
   }));

   return (
      <div
         className = "relative popup"
         onClick = {(event) => {
            // Ensure the onClick does that propagate to parent component
            event.stopPropagation();

            if (open === false) {
               // Trigger defined onClick on display, if any
               props.onClick?.call(null, event);
               setOpen(true);
            }
         }}
      >
         {
            props.cover ?? (
               <Button
                  type = "button"
                  className = {props.buttonClassName}
                  icon = {props.icon}
               >
                  {props.text}
               </Button>
            )
         }
         {
            open && (
               <div className = {clsx("fixed w-full mx-auto inset-0 flex items-center justify-center align-center p-4 z-50", props.className)}>
                  <div className = "fixed inset-0 bg-gray-600 bg-opacity-50"></div>
                  <div className = "relative bg-white rounded-lg shadow-lg px-10 py-12 w-full max-h-[90%] overflow-y-auto">
                     <Button
                        className = "absolute top-3 right-3"
                        onClick = {(event) => {
                           // Ensure the onClick does that propagate to parent cover component
                           event.stopPropagation();
                           onClose();
                        }}
                     >
                        <FontAwesomeIcon
                           icon = {faXmark}
                           className = "text-2xl text-red-500"
                        />
                     </Button>
                     <div
                        tabIndex = {0}
                        className = "popup"
                        onKeyDown = {(event) => {
                           // Close the active popup in the DOM via the escape key
                           const target = event.target as HTMLElement;

                           if (event.key === "Escape"
                                 && target.tagName !== "INPUT"
                                 && target.tagName !== "TEXTAREA"
                                 && !(target.isContentEditable)
                                 && target.classList.contains("popup")) {
                              event.stopPropagation();
                              onClose();
                           }
                        }}
                     >
                        {props.children}
                     </div>
                  </div>
               </div>
            )
         }
      </div>
   );
});
