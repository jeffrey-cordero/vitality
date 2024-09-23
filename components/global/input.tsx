import clsx from "clsx";
import Button from "@/components/global/button";
import { ChangeEvent, Dispatch, useRef } from "react";
import { faEye, faEyeSlash, faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VitalityAction, VitalityState, VitalityInputState } from "@/lib/global/state";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface VitalityInputProps extends React.InputHTMLAttributes<any> {
   label: string;
   icon?: IconProp;
   input: VitalityInputState;
   dispatch: Dispatch<VitalityAction<any>>;
   state?: VitalityState;
   data?: { [key: string]: any };
}

export default function Input({ ...props }: VitalityInputProps): JSX.Element {
   const { label, icon, placeholder, input, dispatch, onChange } = props;
   const inputRef = useRef<HTMLInputElement>(null);
   const passwordButton = useRef<SVGSVGElement | null>(null);

   return (
      <div className = "relative">
         <input
            type = {input.type ?? ""}
            id = {input.id}
            value = {input.value}
            ref = {inputRef}
            placeholder = {placeholder ?? ""}
            className = {clsx("peer p-4 block w-full rounded-lg text-sm font-semibold border-1 placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2",
               {
                  "border-gray-200 border-[1.5px]": input.error === null,
                  "border-red-500 border-[1.5px]": input.error !== null
               })}
            onChange = {(event: ChangeEvent<HTMLInputElement>) => {
               if (input.data.handlesChanges !== undefined) {
                  // Call the user-defined event handler (complex state)
                  onChange?.call(null, event);
               } else {
                  // Simple state
                  dispatch({
                     type: "updateInput",
                     value: {
                        ...input,
                        value: event.target.value,
                        error: null
                     }
                  });
               }
            }}
         />
         {(input.type === "password" || passwordButton.current !== null) &&
            <Button type = "button" className = "absolute top-[4.5px] end-0 p-3.5 rounded-e-md">
               <FontAwesomeIcon
                  icon = {input.type == "password" ? faEye : faEyeSlash}
                  className = "flex-shrink-0 size-3.5 password-icon"
                  ref = {passwordButton}
                  onClick = {() => {
                     if (passwordButton.current !== null) {
                        inputRef.current?.focus();

                        if (input.type === "password") {
                           passwordButton.current.classList.add("text-primary");
                        } else {
                           passwordButton.current.classList.remove("text-primary");

                        }

                        dispatch({
                           type: "updateInput",
                           value: {
                              ...input,
                              type: input.type === "password" ? "text" : "password"
                           }
                        });
                     }
                  }} />
            </Button>
         }
         {
            input.data.validIcon !== undefined &&
               (input.data.validIcon || !(input.data.validIcon !== undefined) && input.error != null) && (
               <Button type = "button" className = "absolute top-[5px] end-0 p-3.5 rounded-e-md">
                  <FontAwesomeIcon
                     icon = {input.data.validIcon ? faCircleCheck : faCircleXmark}
                     className = {clsx("flex-shrink-0 size-3.5 password-icon", {
                        "text-green-500" : input.data.validIcon,
                        "text-red-500": !(input.data.validIcon)
                     })}
                  />
               </Button>
            )
         }
         <label
            htmlFor = {input.id}
            className = {clsx("absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500", {
               "font-bold": label.includes("*")
            })}>
            { icon && <FontAwesomeIcon icon = {icon} /> } { label }
         </label>
         {input.error !== null &&
            <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
               <p className = "text-red-500 font-bold input-error"> {input.error[0]} </p>
            </div>
         }
      </div>
   );
}