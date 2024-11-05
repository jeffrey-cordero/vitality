import Button from "@/components/global/button";
import { Modal } from "@/components/global/modal";
import { faArrowRotateBack, faSquareCheck, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";

interface ConformationProps {
   message: string;
   onConformation: () => void;
   icon?: boolean;
}

export default function Conformation(props: ConformationProps): JSX.Element {
   const { message, onConformation, icon } = props;
   const deleteModalRef = useRef<{ open: () => void, close: () => void }>(null);

   return (
      <Modal
         className = "max-w-[80%] sm:max-w-md max-h-[90%] mt-12 text-center"
         ref = {deleteModalRef}
         display = {
            icon ? (
               <div className = "bg-white">
                  <FontAwesomeIcon
                     icon = {faTrashCan}
                     className = "cursor-pointer  text-red-500 text-xl my-4"
                  />
               </div>
            ) : (
               <Button
                  type = "button"
                  className = "w-full bg-red-500 text-white h-[2.4rem]"
                  icon = {faTrash}
               >
                  Delete
               </Button>
            )
         }
      >
         <div className = "relative flex flex-col justify-between items-center gap-4 p-2">
            <FontAwesomeIcon
               icon = {faTrashCan}
               className = "text-red-500 text-3xl" />
            <p className = "font-bold">
               {message}
            </p>
            <div className = "flex flex-row flex-wrap justify-center items-center gap-2">
               <Button
                  type = "button"
                  icon = {faArrowRotateBack}
                  className = "w-[10rem] bg-gray-100 text-black px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.4rem] focus:border-blue-500 focus:ring-blue-500"
                  onClick = {() => {
                     // Close the confirmation modal
                     if (deleteModalRef.current) {
                        deleteModalRef.current.close();
                     }
                  }}
               >
                  No, cancel
               </Button>
               <Button
                  type = "button"
                  icon = {faSquareCheck}
                  className = "w-[10rem] bg-red-500 text-white px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.4rem] focus:border-red-300 focus:ring-red-300"
                  onClick = {async() => onConformation()}
               >
                  Yes, I&apos;m sure
               </Button>
            </div>
         </div>
      </Modal>
   );
}