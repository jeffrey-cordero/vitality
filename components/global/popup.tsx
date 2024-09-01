import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface PopUpProps extends React.HTMLAttributes<HTMLDivElement> {
   children?: React.ReactNode;
   text: string;
}

export default function PopUp(props: PopUpProps): JSX.Element {
   const [open, setOpen] = useState(false);
   
   return (
      <div className="relative p-6 overflow-y-auto">
         <div>
            <button
               className="bg-blue-500 text-white px-4 py-2 rounded-md"
               onClick={() => setOpen(true)}
               >
               {props.text}
            </button>
         </div>
      {
         open && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
               <div className="fixed inset-0 bg-gray-600 bg-opacity-50"></div>
               <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md min-h-[10rem]">
                  <button
                  className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                  onClick={()=> setOpen(false)}
                  >
                  <FontAwesomeIcon 
                     icon={faXmark} 
                     className="text-2xl text-red-500"
                  />
               </button>
               {props.children}
            </div>
         </div>
         )
      }
      </div>
   )
}

