import clsx from "clsx";
import Button from "@/components/global/button";
import { ChangeEvent, Dispatch, useCallback, useEffect, useRef } from "react";
import { faEye, faEyeSlash, faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VitalityAction, VitalityInputState } from "@/lib/global/state";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface VitalityInputProps extends React.InputHTMLAttributes<any> {
   type: string;
   id: string;
   label: string;
   input: VitalityInputState;
   dispatch: Dispatch<VitalityAction<any>>;
   icon?: IconProp;
   onBlur?: () => void;
}

export default function Input({ ...props }: VitalityInputProps): JSX.Element {
   const { id, label, icon, placeholder, className, autoFocus, onChange, onBlur, required, input, dispatch } = props;
   const type = input.data.type ?? props.type;
   const inputRef = useRef<HTMLInputElement>(null);
   const passwordButton = useRef<SVGSVGElement | null>(null);

   useEffect(() => {
      if (inputRef.current && autoFocus) {
         inputRef.current.focus();
      }
   }, [autoFocus]);

   const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      if (input.data.handlesChanges !== undefined) {
         // Call the user-defined event handler (complex state)
         onChange?.call(null, event);
      } else {
         // Simple state
         dispatch({
            type: "updateState",
            value: {
               id: id,
               input: {
                  ...input,
                  value: event.target.value,
                  error: null
               }
            }
         });
      }
   }, [dispatch, input, id, onChange]);

   const handlePasswordIconClick = useCallback(() => {
      if (passwordButton.current !== null) {
         inputRef.current?.focus();

         if (type === "password") {
            passwordButton.current.classList.add("text-primary");
         } else {
            passwordButton.current.classList.remove("text-primary");

         }
         dispatch({
            type: "updateState",
            value: {
               id: id,
               input: {
                  ...input,
                  data: {
                     ...input.data,
                     type: type === "password" ? "text" : "password"
                  }
               }
            }
         });


      }
   }, [dispatch, input, id, type]);

   return (
      <div className = "relative">
         <input
            id = {id}
            type = {type}
            value = {input.value}
            ref = {inputRef}
            placeholder = {placeholder ?? ""}
            className = {clsx("peer p-4 block w-full rounded-lg text-sm font-semibold border-1 placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2",
               {
                  "border-gray-200 border-[1.5px]": input.error === null,
                  "border-red-500 border-[1.5px]": input.error !== null,
                  "focus:border-gray-200 focus:ring-gray-200": onBlur
               }, className)}
            onChange = {(event: ChangeEvent<HTMLInputElement>) => handleInputChange(event)}
         />
         {(type === "password" || passwordButton.current !== null) &&
            <Button tabIndex = {-1} type = "button" className = "absolute top-[4.5px] end-0 p-3.5 rounded-e-md">
               <FontAwesomeIcon
                  icon = {type == "password" ? faEye : faEyeSlash}
                  className = "flex-shrink-0 size-3.5 password-icon"
                  ref = {passwordButton}
                  onClick = {handlePasswordIconClick} />
            </Button>
         }
         {
            input.data.validIcon !== undefined &&
            (input.data.validIcon || !(input.data.validIcon !== undefined) && input.error != null) && (
               <Button tabIndex = {-1} type = "button" className = "absolute top-[5px] end-0 p-3.5 rounded-e-md">
                  <FontAwesomeIcon
                     icon = {input.data.validIcon ? faCircleCheck : faCircleXmark}
                     className = {clsx("flex-shrink-0 size-3.5 password-icon", {
                        "text-green-500": input.data.validIcon,
                        "text-red-500": !(input.data.validIcon)
                     })}
                  />
               </Button>
            )
         }
         <label
            htmlFor = {id}
            className = {clsx(
               "absolute top-0 start-0 p-4 h-full text-sm text-black truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-placeholder-shown:text-sm peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-black peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500",
               {
                  "font-bold": required
               }
            )}>
            {icon && <FontAwesomeIcon icon = {icon} />} {label}
         </label>
         {input.error !== null &&
            // Display current errors, if any
            <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
               <p className = "text-red-500 font-bold input-error"> {input.error} </p>
            </div>
         }
         {
            onBlur && (
               // Close icon for accessibility purposes when onBlur is defined
               <Button type = "button" className = "absolute top-[-20px] right-[-30px] z-50 p-3.5 rounded-e-md">
                  <FontAwesomeIcon
                     icon = {faCircleXmark}
                     className = "cursor-pointer flex-shrink-0 size-3.5 text-red-500 text-md"
                     onClick = {onBlur} />
               </Button>
            )
         }
      </div>
   );
}