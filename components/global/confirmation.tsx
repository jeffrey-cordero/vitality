import Button from "@/components/global/button";
import Modal from "@/components/global/modal";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateBack, faSquareCheck, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";

interface ConformationProps {
  message: string;
  onConformation: () => void;
  icon?: boolean;
}

export default function Conformation(props: ConformationProps): JSX.Element {
   const { message, icon, onConformation } = props;
   const deleteModalRef = useRef<{ open: () => void; close: () => void }>(null);

   return (
      <Modal
         className = "mt-12 max-h-[90%] max-w-[80%] text-center sm:max-w-md"
         ref = { deleteModalRef }
         display = {
            icon ? (
               <div className = "bg-white dark:bg-slate-800">
                  <FontAwesomeIcon
                     icon = { faTrashCan }
                     className = "my-4 cursor-pointer text-xl text-red-500"
                  />
               </div>
            ) : (
               <Button
                  type = "button"
                  className = "h-[2.4rem] w-full bg-red-500 text-white"
                  icon = { faTrash }
               >
                  Delete
               </Button>
            )
         }
      >
         <div className = "relative flex flex-col items-center justify-between gap-4 p-2">
            <FontAwesomeIcon
               icon = { faTrashCan }
               className = "text-3xl text-red-500"
            />
            <p className = "font-bold">
               { message }
            </p>
            <div className = "flex flex-row flex-wrap items-center justify-center gap-2">
               <Button
                  type = "button"
                  icon = { faArrowRotateBack }
                  className = "h-[2.4rem] w-40 border-[1.5px] border-gray-100 bg-gray-100 px-4 py-2 font-bold text-black focus:border-blue-500 focus:ring-blue-500"
                  onClick = {
                     () => {
                        if (deleteModalRef.current) {
                           deleteModalRef.current.close();
                        }
                     }
                  }
               >
                  No, cancel
               </Button>
               <Button
                  type = "button"
                  icon = { faSquareCheck }
                  className = "h-[2.4rem] w-40 border-[1.5px] border-gray-100 bg-red-500 px-4 py-2 font-bold text-white focus:border-red-300 focus:ring-red-300 dark:border-0"
                  onClick = { async() => onConformation() }
               >
                  Yes, I&apos;m sure
               </Button>
            </div>
         </div>
      </Modal>
   );
}