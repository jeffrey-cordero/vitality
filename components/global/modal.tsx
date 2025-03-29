import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
   display: React.ReactNode;
   children: React.ReactNode;
   onClose?: () => void;
   disabled?: boolean;
   locked?: boolean;
}

const Modal = forwardRef(function Modal(props: ModalProps, ref) {
   const { display, children, className, onClick, onClose, disabled, locked } = props;
   const [open, setOpen] = useState<boolean>(false);
   const modalRef = useRef(null);

   // Allow parent components to handle opening/closing the model
   const openModal = (event: any) => {
      onClick?.call(null, event);
      setOpen(true);
   };

   const closeModal = useCallback(() => {
      if (locked) return;

      onClose?.call(null);
      setOpen(false);
   }, [
      locked,
      onClose
   ]);

   useImperativeHandle(ref, () => ({
      close: closeModal,
      open: openModal,
      isOpen: () => open
   }));

   useEffect(() => {
      const modals = document.getElementsByClassName("modal");

      if (modals.length > 0 && open) {
         document.body.parentElement.style.overflowY = "hidden";
      }

      return () => {
         if (modals.length === 0) {
            document.body.parentElement.style.overflowY = "initial";
         }
      };
   }, [open]);

   return (
      <div className = "relative">
         <div
            onClick = { disabled !== true ? openModal : undefined }
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
                              closeModal();
                           }
                        }
                     }
                     className = "modal scrollbar-hide relative max-h-[95%] w-full overflow-y-auto overflow-x-hidden rounded-2xl bg-white p-6 px-5 shadow-lg focus:outline-none lg:px-7 dark:bg-slate-800"
                  >
                     <div className = "absolute -top-px right-[3px] z-50 rounded-e-md p-3.5">
                        <FontAwesomeIcon
                           onClick = {
                              (event) => {
                                 event.stopPropagation();
                                 closeModal();
                              }
                           }
                           icon = { faXmark }
                           className = "modal-close cursor-pointer text-xl font-extrabold text-red-500"
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