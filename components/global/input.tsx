import clsx from "clsx";
import { ChangeEvent, useRef } from "react";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputProps } from "@/lib/global/form";

export default function Input({ ...props }: InputProps): JSX.Element {
   const input = useRef<HTMLInputElement>(null);
   const eyeButton = useRef<SVGSVGElement | null>(null);

   return (
      <div className="relative">
         <input
            type={props.input.type}
            id={props.input.id}
            value={props.input.value}
            ref={input}
            className={clsx("peer p-4 block w-full rounded-lg text-sm font-semibold border-1 placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2",
               {
                  "border-gray-200": props.input.error === null,
                  "border-red-500": props.input.error !== null
               })}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
               props.dispatch({
                  type: 'updateInput',
                  value: {
                     ...props.input,
                     value: event.target.value,
                     error: null
                  },
               });
            }}
         />
         {(props.input.type === "password" || eyeButton.current !== null) &&
            <button type="button" className="absolute top-0 end-0 p-3.5 rounded-e-md">
               <FontAwesomeIcon
                  icon={faEye}
                  className="flex-shrink-0 size-3.5 password-icon"
                  ref={eyeButton}
                  onClick={() => {
                     if (eyeButton.current !== null) {
                        input.current?.focus();
                        
                        if (props.input.type === "password") {
                           eyeButton.current.classList.add("text-primary");
                        } else {
                           eyeButton.current.classList.remove("text-primary");

                        }
                        // eyeButton.current.style.color = props.input.type === "password" ? "blue" : "black";

                        props.dispatch({
                           type: 'updateInput',
                           value: {
                              ...props.input,
                              type: props.input.type === "password" ? "text" : "password",
                           },
                        });
                     }
                  }} />
            </button>
         }
         <label
            htmlFor={props.input.id}
            className={clsx("absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500", {
               "font-bold": props.label.includes("*")
            })}>
            {props.label}
         </label>
         {props.input.error !== null &&
            <div className="flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
               <p className="text-red-500 input-error"> {props.input.error[0]} </p>
            </div>
         }
      </div>
   );
}
