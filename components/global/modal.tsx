"use client";
import { useState } from "react";

interface ModalProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
   children?: React.ReactNode;
   className?: string;
}

export default function Modal(props: ModalProps): JSX.Element {
   const [visible, setVisible] = useState<boolean>(false);

   return (
      <div>
         <button
            className = "block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type = "button"
            onClick = {() => setVisible(!(visible))}
         >
            Toggle modal
         </button>
         {
            visible && (

               <div className = "overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-1/2 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                  <div className = "relative p-4 w-full max-w-2xl max-h-full">
                     <div className = "relative bg-white rounded-lg shadow">
                        {props.children}
                     </div>
                  </div>
               </div>
            )}
      </div>
   );
}