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

   useEffect(() => {
      const modals = document.getElementsByClassName("modal");

      if (modals.length > 0) {
         document.body.parentElement.style.overflowY = "hidden";
      }

      return () => {
         if (modals.length === 0) {
            document.body.parentElement.style.overflowY = "initial";
         }
      };
   }, []);

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
                     tabIndex = {0}
                     onKeyDown = {(event) => {
                        event.stopPropagation();
                        // Close the active modal in the DOM through the escape key
                        const target = event.target as HTMLElement;

                        if (event.key === "Escape" && target.classList.contains("modal")) {
                           handleOnClose();
                        }
                     }}
                     className = "relative bg-white rounded-lg shadow-lg p-6 md:py-6 md:px-8 w-full max-h-[90%] overflow-y-auto focus:outline-none modal scrollbar-hide">
                     <div className = "absolute top-[2px] right-[5px] z-50 p-3.5 rounded-e-md">
                        <FontAwesomeIcon
                           onClick = {(event) => {
                              event.stopPropagation();
                              handleOnClose();
                           }}
                           icon = {faXmark}
                           className = "cursor-pointer flex-shrink-0 size-4.5 text-2xl text-red-500 text-md font-extrabold modal-close"
                           fill = "black"
                        />
                     </div>
                     <div>
                        {children}
                     </div>
                  </div>
               </div>
            )
         }
      </div>
   );
});
