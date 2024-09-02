import clsx from "clsx";
import { ChangeEvent, Dispatch, useRef } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormAction, InputState } from "@/lib/global/form";

export interface InputProps extends React.InputHTMLAttributes<any> {
   label: string;
   input: InputState;
   dispatch: Dispatch<FormAction>;
 }

export default function Input({ ...props }: InputProps): JSX.Element {
   const input = useRef<HTMLInputElement>(null);
   const passwordButton = useRef<SVGSVGElement | null>(null);

   return (
      <div className = "relative">
         <input
            type = {props.input.type}
            id = {props.input.id}
            value = {props.input.value}
            ref = {input}
            placeholder = {props.placeholder ?? ""}
            className = {clsx("peer p-4 block w-full rounded-lg text-sm font-semibold border-1 placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2",
               {
                  "border-gray-200 border-[1.5px]": props.input.error === null,
                  "border-red-500 border-[1.5px]": props.input.error !== null
               })}
            onChange = {(event: ChangeEvent<HTMLInputElement>) => {
               props.dispatch({
                  type: "updateInput",
                  value: {
                     ...props.input,
                     value: event.target.value,
                     error: null
                  }
               });
            }}
         />
         {(props.input.type === "password" || passwordButton.current !== null) &&
            <button type = "button" className = "absolute top-0 end-0 p-3.5 rounded-e-md">
               <FontAwesomeIcon
                  icon = {props.input.type == "password" ? faEye : faEyeSlash}
                  className = "flex-shrink-0 size-3.5 password-icon"
                  ref = {passwordButton}
                  onClick = {() => {
                     if (passwordButton.current !== null) {
                        input.current?.focus();

                        if (props.input.type === "password") {
                           passwordButton.current.classList.add("text-primary");
                        } else {
                           passwordButton.current.classList.remove("text-primary");

                        }

                        props.dispatch({
                           type: "updateInput",
                           value: {
                              ...props.input,
                              type: props.input.type === "password" ? "text" : "password"
                           }
                        });
                     }
                  }} />
            </button>
         }
         <label
            htmlFor = {props.input.id}
            className = {clsx("absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500", {
               "font-bold": props.label.includes("*")
            })}>
            {props.label}
         </label>
         {props.input.error !== null &&
            <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
               <p className = "text-red-500 font-bold input-error"> {props.input.error[0]} </p>
            </div>
         }
      </div>
   );
}
