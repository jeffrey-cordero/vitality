import Button from "@/components/global/button";
import Modal from "@/components/global/modal";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";

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
         className = "py-3 max-h-[90%] max-w-[80%] text-center xsm:max-w-xs"
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
                  className = "h-[2.4rem] w-full bg-red-500 text-white"
                  icon = { faTrash }
               >
                  Delete
               </Button>
            )
         }
      >
         <div className = "relative flex flex-col items-center justify-between gap-4 pt-4  text-[0.95rem] xsm:text-base">
            <p className = "font-bold">
               { message }
            </p>
            <Button
               type = "button"
               icon = { faTrashCan }
               className = "h-[2.1rem] border-[1.5px] border-gray-100 bg-red-500 px-5 py-2 text-[0.9rem] font-bold text-white focus:border-red-300 focus:ring-red-300 xsm:h-[2.3rem] xsm:text-base dark:border-0"
               onClick = { async() => onConformation() }
            >
               Yes
            </Button>
         </div>
      </Modal>
   );
}