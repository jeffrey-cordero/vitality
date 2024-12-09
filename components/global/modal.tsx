import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  display: React.ReactNode;
  children: React.ReactNode;
  onClose?: () => void;
}

const Modal = forwardRef(function Modal(props: ModalProps, ref) {
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
            onClick = {
               (event) => {
               // Ensure the onClick doesn't propagate to parent components
                  event.stopPropagation();

                  if (!open) {
                  // Trigger the defined onClick method for the display container, if any
                     onClick?.call(null, event);
                     setOpen(true);
                  }
               }
            }
         >
            { display }
         </div>
         {
            open && (
               <div
                  className = {
                     clsx(
                        "fixed inset-0 z-50 mx-auto flex w-full items-center justify-center p-4",
                        className,
                     )
                  }
               >
                  <div className = "fixed inset-0 bg-gray-600/60"></div>
                  <div
                     ref = { modalRef }
                     tabIndex = { 0 }
                     onKeyDown = {
                        (event) => {
                           // Close the modal element via the Escape key and prevent further propagation for nested modals
                           event.stopPropagation();

                           const target = event.target as HTMLElement;

                           if (event.key === "Escape" && target.classList.contains("modal")) {
                              handleOnClose();
                           }
                        }
                     }
                     className = "modal scrollbar-hide relative max-h-[90%] w-full overflow-y-auto rounded-lg bg-white p-6 shadow-lg focus:outline-none md:px-8 md:py-6 dark:bg-slate-800"
                  >
                     <div className = "absolute -top-px right-[3px] z-50 rounded-e-md p-3.5">
                        <FontAwesomeIcon
                           onClick = {
                              (event) => {
                                 event.stopPropagation();
                                 handleOnClose();
                              }
                           }
                           icon = { faXmark }
                           className = "modal-close size-4 shrink-0 cursor-pointer text-xl font-extrabold text-red-500"
                           fill = "black"
                        />
                     </div>
                     <>
                        { children }
                     </>
                  </div>
               </div>
            )
         }
      </div>
   );
});

export default Modal;