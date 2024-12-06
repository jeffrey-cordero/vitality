import Button from "@/components/global/button";
import Modal from "@/components/global/modal";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareCheck, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";

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
            <Button
               type = "button"
               icon = { faSquareCheck }
               className = "h-10 border-[1.5px] border-gray-100 bg-red-500 px-5 py-2 font-bold text-white focus:border-red-300 focus:ring-red-300 dark:border-0"
               onClick = { async() => onConformation() }
            >
               Yes
            </Button>
         </div>
      </Modal>
   );
}