import Button from "@/components/global/button";
import Modal from "@/components/global/modal";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faRotateBack, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";

interface ConfirmationProps {
  message: string;
  onConfirmation: () => void;
  icon?: boolean;
}

export default function Confirmation(props: ConfirmationProps): JSX.Element {
   const { message, icon, onConfirmation } = props;
   const deleteModalRef = useRef<{ open: () => void; close: () => void }>(null);

   return (
      <Modal
         className = "max-h-[90%] max-w-[90%] px-4 py-3 text-center xsm:max-w-sm"
         ref = { deleteModalRef }
         display = {
            icon ? (
               <div className = "bg-white dark:bg-slate-800">
                  <FontAwesomeIcon
                     icon = { faTrashCan }
                     className = "my-[0.83rem] cursor-pointer text-lg text-red-500"
                  />
               </div>
            ) : (
               <Button
                  type = "button"
                  className = "h-[2.4rem] w-full bg-red-500 text-white focus:ring-red-700"
                  icon = { faTrash }
               >
                  Delete
               </Button>
            )
         }
      >
         <div className = "relative flex flex-col items-center justify-between gap-3 pb-2 pt-4">
            <p className = "px-2 text-[1.1rem] font-bold">
               { message }
            </p>
            <div className = "mx-auto flex w-full flex-col items-center justify-center gap-1 sm:flex-row">
               <Button
                  type = "button"
                  icon = { faRotateBack }
                  className = "h-[2.3rem] w-full border-[1.5px] border-gray-100 bg-gray-500 px-5 py-2 text-base font-bold text-white sm:w-32 dark:border-0"
                  onClick = { async() => deleteModalRef.current?.close() }
               >
                  Cancel
               </Button>
               <Button
                  type = "button"
                  icon = { faCheck }
                  className = "h-[2.3rem] w-full border-[1.5px] border-gray-100 bg-red-500 px-5 py-2 text-base font-bold text-white focus:border-red-500 focus:ring-red-700 sm:w-32 dark:border-0"
                  onClick = { async() => onConfirmation() }
               >
                  Confirm
               </Button>
            </div>
         </div>
      </Modal>
   );
}