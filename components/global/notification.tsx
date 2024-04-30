import { SubmissionStatus } from "@/lib/form";
import { useState } from "react";
import clsx from 'clsx';

export function Notification({ status }: { status: SubmissionStatus }): JSX.Element {
   const [visible, setVisible] = useState<boolean>(true);

   return (
      <>
         {
            visible && 
            <div className={clsx("w-[15rem] min-h-[3rem] h-auto p-5 rounded animate-notificationIn", {
               "bg-green-100 border border-green-400 text-green-700": status.state == "Success",
               "bg-red-100 border border-red-400 text-red-700" : status.state == "Error",
               "bg-orange-100 border border-orange-400 text-orange-700": status.state == "Failure",
               
            })}>
               <strong className="font-bold">{status.state}</strong>
               <p>{status.response?.message}</p>
               <span className="absolute top-0 bottom-0 right-0 p-1">
                  <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
               </span>
            </div>
         }
      </>
         
   );
}