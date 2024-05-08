import { SubmissionStatus } from "@/lib/form";
import { faCircleCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";


export function Notification ({ status }: { status: SubmissionStatus }): JSX.Element {
   // TODO -- remove ??, add different colors, try to slide up or FADE OUT, make x button red, etc.

   const color = status.state === "Success" || 1 ? "green-400" : "red-400";
   const icon = status.state === "Success" ? faCircleCheck : faTriangleExclamation;

   console.log(`border-l-${color}`);

   return (
      <>
         {
            <div className = "p-6 animate-notificationIn">
               <div className = "text-left">
                  <div className = {clsx("w-[30rem] max-w-10/12 border-stroke mb-11 flex items-center rounded-md border border-l-[8px] bg-white p-5 pl-8", `border-l-${color}`)}>
                     <div className = "mr-5 flex h-[50px] w-full max-w-[50px] items-center justify-center rounded-full">
                        <FontAwesomeIcon icon = {icon} className = {`text-2xl text-${color}`}/>
                     </div>
                     <div className = "flex w-full items-start justify-between">
                        <div>
                           <h3 className = "mb-1 text-lg font-bold text-dark">
                              {status.response.message ?? "N/A"}
                           </h3>
                           <p className = "text-body-color text-sm">
                              {status.response.message ?? "An error occurred. Please try again."}
                           </p>
                        </div>
                        <div>
                           <a
                              className = "hover:text-danger hover:cursor-pointer text-red-600"
                           >
                              <svg
                                 width = {24}
                                 height = {24}
                                 viewBox = "0 0 24 24"
                                 className = "fill-current"
                              >
                                 <path
                                    fillRule = "evenodd"
                                    clipRule = "evenodd"
                                    d = "M18.8839 5.11612C19.372 5.60427 19.372 6.39573 18.8839 6.88388L6.88388 18.8839C6.39573 19.372 5.60427 19.372 5.11612 18.8839C4.62796 18.3957 4.62796 17.6043 5.11612 17.1161L17.1161 5.11612C17.6043 4.62796 18.3957 4.62796 18.8839 5.11612Z"
                                 />
                                 <path
                                    fillRule = "evenodd"
                                    clipRule = "evenodd"
                                    d = "M5.11612 5.11612C5.60427 4.62796 6.39573 4.62796 6.88388 5.11612L18.8839 17.1161C19.372 17.6043 19.372 18.3957 18.8839 18.8839C18.3957 19.372 17.6043 19.372 17.1161 18.8839L5.11612 6.88388C4.62796 6.39573 4.62796 5.60427 5.11612 5.11612Z"
                                 />
                              </svg>
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         }</>
   );
}