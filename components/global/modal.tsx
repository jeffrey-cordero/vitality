import clsx from "clsx";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
   display: React.ReactNode;
   children: React.ReactNode;
   onClose?: () => void;
}

export const Modal = forwardRef(function Modal(props: ModalProps, ref) {
   const { display, children, className, onClick, onClose } = props;
   const [open, setOpen] = useState<boolean>(false);
   const modalRef = useRef(null);

   // Allow children components to handle opening/closing the model outside of click events
   const handleOnClose = useCallback(() => {
      onClose?.call(null);
      setOpen(false);
   }, [onClose]);

   const handleOnOpen = () => {
      setOpen(true);
   };

   useImperativeHandle(ref, () => ({
      close: handleOnClose,
      open: handleOnOpen
   }));

   // Close the modal when clicking outside of the area
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         event.stopPropagation();

         if (modalRef.current && !(modalRef.current.contains(event.target as Node))) {
            handleOnClose();
         }
      };

      if (open) {
         document.addEventListener("mousedown", handleClickOutside);
      } else {
         document.removeEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [open, handleOnClose]);

   return (
      <div className = "relative">
         <div
            onClick = {(event) => {
               // Ensure the onClick does that propagate to parent component
               event.stopPropagation();

               if (open === false) {
                  // Trigger defined onClick on display, if any
                  onClick?.call(null, event);
                  setOpen(true);
               }
            }}
         >
            {display}
         </div>
         {
            open && (
               <div className = {clsx("fixed w-full mx-auto p-4 inset-0 flex items-center justify-center align-center z-50", className)}>
                  <div className = "fixed inset-0 bg-gray-600 bg-opacity-50"></div>
                  <div
                     ref = {modalRef}
                     className = "relative bg-white rounded-lg shadow-lg p-6 md:py-6 md:px-8 w-full max-h-[90%] overflow-y-auto scrollbar-hide">
                     <div className = "absolute top-[10px] right-[10px] z-50 p-3.5 rounded-e-md">
                        <FontAwesomeIcon
                           icon = {faXmark}
                           className = "cursor-pointer flex-shrink-0 size-4.5 text-2xl text-red-500 text-md font-extrabold"
                           fill = "black"
                           onClick = {(event) => {
                              // Ensure the onClick does that propagate to parent display component
                              event.stopPropagation();
                              handleOnClose();
                           }} />
                     </div>
                     <div
                        tabIndex = {0}
                        className = "modal"
                        onKeyDown = {(event) => {
                           // Close the active modal in the DOM through the escape key
                           const target = event.target as HTMLElement;

                           if (event.key === "Escape" && target.classList.contains("modal")) {
                              event.stopPropagation();
                              handleOnClose();
                           }
                        }}
                     >
                        {children}
                     </div>
                  </div>
               </div>
            )
         }
      </div>
   );
});
