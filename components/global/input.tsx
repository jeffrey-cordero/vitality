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
   onSubmit?: () => void;
   scrollIntoView?: boolean;
}

export default function Input(props: VitalityInputProps): JSX.Element {
   const { id, label, type, icon, placeholder, className, min, autoFocus, scrollIntoView, autoComplete, onChange, onSubmit, required, input, dispatch } = props;
   const inputType = input.data.type ?? type;
   const inputRef = useRef<HTMLInputElement>(null);
   const passwordButton = useRef<SVGSVGElement | null>(null);

   useEffect(() => {
      inputRef.current && autoFocus && inputRef.current.focus();
      inputRef.current && scrollIntoView && inputRef.current.scrollIntoView({ behavior: "instant", block: "center" });
   }, [
      autoFocus,
      scrollIntoView,
      input.error
   ]);

   const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      if (input.handlesOnChange) {
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
   }, [
      dispatch,
      input,
      id,
      onChange
   ]);

   const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (inputRef.current && event.key === "Escape") {
         inputRef.current.blur();

         const modals: HTMLCollection = document.getElementsByClassName("modal");

         if (modals.length > 0) {
            (modals.item(modals.length - 1) as HTMLDivElement).focus();
         }
      } else if (event.key === "Enter") {
         onSubmit?.call(null);
      }
   }, [onSubmit]);

   const handlePasswordIconClick = useCallback(() => {
      if (passwordButton.current !== null) {
         inputRef.current?.focus();

         if (inputType === "password") {
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
                     type: inputType === "password" ? "text" : "password"
                  }
               }
            }
         });
      }
   }, [
      dispatch,
      input,
      id,
      inputType
   ]);

   return (
      <div className = "relative">
         <input
            id = {id}
            type = {inputType}
            value = {input.value}
            autoComplete = {autoComplete ?? undefined}
            min = {min ?? undefined}
            ref = {inputRef}
            placeholder = {placeholder ?? ""}
            className = {clsx("peer p-4 block w-full rounded-lg text-sm font-semibold border-1 placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2",
               {
                  "border-gray-200 border-[1.5px]": input.error === null,
                  "border-red-500 border-[1.5px] focus:border-red-500 focus:ring-red-500 error": input.error !== null
               }, className)}
            onKeyDown = {(event: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(event)}
            onChange = {(event: ChangeEvent<HTMLInputElement>) => handleInputChange(event)}
         />
         {(inputType === "password" || passwordButton.current !== null) &&
            <Button
               tabIndex = {-1}
               type = "button"
               className = "absolute top-[4.5px] end-0 p-3.5 rounded-e-md">
               <FontAwesomeIcon
                  icon = {inputType == "password" ? faEye : faEyeSlash}
                  className = "flex-shrink-0 size-3.5 password-icon"
                  ref = {passwordButton}
                  onClick = {handlePasswordIconClick}
               />
            </Button>
         }
         {
            input.data.valid !== undefined && (
               <Button
                  tabIndex = {-1}
                  type = "button"
                  className = "absolute top-[4.5px] end-0 p-3.5 rounded-e-md">
                  <FontAwesomeIcon
                     icon = {input.data.valid ? faCircleCheck : faCircleXmark}
                     className = {clsx("flex-shrink-0 size-3.5", {
                        "text-green-500": input.data.valid,
                        "text-red-500": !(input.data.valid)
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
            <div className = "flex justify-center align-center text-center max-w-[90%] mx-auto gap-2 my-3 opacity-0 animate-fadeIn">
               <p className = "text-red-500 font-bold input-error"> {input.error.trim()} </p>
            </div>
         }
      </div>
   );
}