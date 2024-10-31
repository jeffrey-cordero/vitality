import clsx from "clsx";
import Button from "@/components/global/button";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
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
   const handleOnClose = () => {
      onClose?.call(null);
      setOpen(false);
   };

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
   }, [open]);

   return (
      <div className="relative modal">
         <div
            onClick={(event) => {
               // Ensure the onClick does that propagate to parent component
               event.stopPropagation();

               if (open === false) {
                  // Trigger defined onClick on display, if any
                  onClick?.call(null, event);
                  setOpen(true);
               }
            }}
         >
            { display }
         </div>
         {
            open && (
               <div className={clsx("fixed w-full mx-auto p-4 inset-0 flex items-center justify-center align-center z-50", className)}>
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50"></div>
                  <div
                     ref={modalRef}
                     className="relative bg-white rounded-lg shadow-lg px-6 md:px-10 py-8 w-full max-h-[90%] overflow-y-auto scrollbar-hide">
                     <Button
                        className="absolute top-3 right-3"
                        onClick={(event) => {
                           // Ensure the onClick does that propagate to parent display component
                           event.stopPropagation();
                           handleOnClose();
                        }}
                     >
                        <FontAwesomeIcon
                           icon={faXmark}
                           className="text-2xl text-red-500"
                        />
                     </Button>
                     <div
                        tabIndex={0}
                        className="modal"
                        onKeyDown={(event) => {
                           // Close the active modal in the DOM via the escape key
                           const target = event.target as HTMLElement;

                           if (event.key === "Escape"
                              && target.tagName !== "INPUT"
                              && target.tagName !== "TEXTAREA"
                              && !(target.isContentEditable)
                              && target.classList.contains("modal")) {
                              event.stopPropagation();
                              onClose();
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
