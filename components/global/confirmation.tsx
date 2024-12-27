import { faCheck, faRotateBack, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";

import Button from "@/components/global/button";
import Modal from "@/components/global/modal";

interface ConfirmationProps {
  message: string;
  onConfirmation: () => Promise<void>;
  display?: React.ReactNode;
  icon?: boolean;
}

export default function Confirmation(props: ConfirmationProps): JSX.Element {
   const { display, message, icon, onConfirmation } = props;
   const confirmModalRef = useRef<{ open: () => void; close: () => void; isOpen: () => boolean }>(null);
   const confirmButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   return (
      <Modal
         className = "max-h-[90%] max-w-[90%] px-4 py-3 text-center xsm:max-w-sm"
         ref = { confirmModalRef }
         display = {
            display !== undefined ? display : icon ? (
               <div className = "bg-white dark:bg-slate-800">
                  <FontAwesomeIcon
                     icon = { faTrashCan }
                     className = "my-[0.83rem] cursor-pointer text-xl text-red-500"
                  />
               </div>
            ) : (
               <Button
                  type = "button"
                  className = "h-10 w-full bg-red-500 text-white focus:ring-red-700"
                  icon = { faTrash }
                  onClick = { () => confirmButtonRef.current?.confirm() }
               >
                  Delete
               </Button>
            )
         }
      >
         <div className = "relative flex flex-col items-center justify-between gap-3 pb-1 pt-4">
            <p className = "px-2 text-[1.1rem] font-bold">
               { message }
            </p>
            <div className = "mx-auto flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
               <Button
                  type = "button"
                  icon = { faRotateBack }
                  className = "h-[2.3rem] w-full border-[1.5px] border-gray-100 bg-gray-500 px-5 py-2 text-base font-bold text-white sm:w-32 dark:border-0"
                  onClick = { async() => confirmModalRef.current?.close() }
               >
                  Cancel
               </Button>
               <Button
                  ref = { confirmButtonRef }
                  type = "button"
                  icon = { faCheck }
                  className = "h-[2.3rem] w-full border-[1.5px] border-gray-100 bg-red-500 px-5 py-2 text-base font-bold text-white focus:border-red-500 focus:ring-red-700 sm:w-32 dark:border-0"
                  onClick = { () => confirmButtonRef.current?.confirm() }
                  onConfirmation = { onConfirmation }
               >
                  Confirm
               </Button>
            </div>
         </div>
      </Modal>
   );
}