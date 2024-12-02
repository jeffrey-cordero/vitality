import clsx from "clsx";
import Button from "@/components/global/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { VitalityAction, VitalityInputState } from "@/lib/global/state";
import { ChangeEvent, Dispatch, useCallback, useEffect, useRef } from "react";
import { faEye, faEyeSlash, faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

export interface VitalityInputProps extends React.InputHTMLAttributes<any> {
   label: string;
   input: VitalityInputState;
   dispatch: Dispatch<VitalityAction<any>>;
   icon?: IconProp;
   onSubmit?: () => void;
   scrollIntoView?: boolean;
}

export function Input(props: VitalityInputProps): JSX.Element {
   const { id, label, type, icon, placeholder, className, min, autoFocus, scrollIntoView,
      autoComplete, onChange, onSubmit, required, input, dispatch } = props;
   const inputType = input.data.type ?? type;
   const inputRef = useRef<HTMLInputElement>(null);
   const passwordButton = useRef<SVGSVGElement | null>(null);

   useEffect(() => {
      autoFocus && inputRef.current?.focus();
      scrollIntoView && inputRef.current?.scrollIntoView({ behavior: "instant", block: "center" });
   }, [
      autoFocus,
      scrollIntoView,
      input.error
   ]);

   const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      if (input.handlesOnChange) {
         onChange?.call(null, event);
      } else {
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
         // Focus the top-most modal in the DOM when blurring current input element, if any
         inputRef.current?.blur();

         const modals: HTMLCollection = document.getElementsByClassName("modal");

         if (modals.length > 0) {
            (modals.item(modals.length - 1) as HTMLDivElement).focus();
         }
      } else if (event.key === "Enter") {
         onSubmit?.call(null);
      }
   }, [onSubmit]);

   const handlePasswordIconClick = useCallback(() => {
      inputRef.current?.focus();

      if (inputType === "password") {
         passwordButton.current?.classList.add("text-primary");
      } else {
         passwordButton.current?.classList.remove("text-primary");
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
   }, [
      dispatch,
      input,
      id,
      inputType
   ]);

   return (
      <div className = "relative">
         <input
            id = { id }
            type = { inputType }
            value = { input.value }
            autoComplete = { autoComplete ?? undefined }
            min = { min ?? undefined }
            ref = { inputRef }
            placeholder = { placeholder ?? "" }
            className = {
               clsx("peer p-4 block w-full rounded-lg text-sm font-semibold border-1 dark:border-0 placeholder:text-transparent bg-white dark:bg-gray-700/50 focus:border-blue-500 focus:border-[1.5px] focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-7 focus:pb-2 [&:not(:placeholder-shown)]:pt-7 [&:not(:placeholder-shown)]:pb-2 autofill:pt-7 autofill:pb-2 dark:[color-scheme:dark]",
                  {
                     "border-gray-200 border-[1.5px]": input.error === null,
                     "border-red-500 border-[2px] focus:border-red-500 focus:ring-red-500 error": input.error !== null
                  }, className)
            }
            onKeyDown = { (event: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(event) }
            onChange = { (event: ChangeEvent<HTMLInputElement>) => handleInputChange(event) }
         />
         {
            (inputType === "password" || passwordButton.current !== null) && (
               <Button
                  tabIndex = { -1 }
                  type = "button"
                  className = "absolute top-[8px] end-0 p-3.5 rounded-e-md">
                  <FontAwesomeIcon
                     icon = { inputType == "password" ? faEye : faEyeSlash }
                     className = "flex-shrink-0 size-4.5 password-icon"
                     ref = { passwordButton }
                     onClick = { handlePasswordIconClick }
                  />
               </Button>
            )
         }
         {
            input.data.valid !== undefined && (
               <Button
                  tabIndex = { -1 }
                  type = "button"
                  className = "absolute top-[8px] end-0 p-3.5 rounded-e-md">
                  <FontAwesomeIcon
                     icon = { input.data.valid ? faCircleCheck : faCircleXmark }
                     className = {
                        clsx("flex-shrink-0 size-4", {
                           "text-green-500": input.data.valid,
                           "text-red-500": !(input.data.valid)
                        })
                     }
                  />
               </Button>
            )
         }
         <label
            htmlFor = { id }
            className = {
               clsx(
                  "absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-black peer-placeholder-shown:text-sm peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-black dark:peer-placeholder-shown:text-white peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500 dark:peer-[:not(:placeholder-shown)]:text-gray-400",
                  {
                     "font-bold": required,
                     "dark:peer-[:not(:placeholder-shown)]:text-white" : type === "date" && input.value === "",
                     "dark:peer-[:not(:placeholder-shown)]:text-gray-400" : type === "date" && input.value !== ""
                  }
               )
            }>
            { 
            icon && (
               <FontAwesomeIcon 
                  icon = { icon }
                  className="mr-[4px]" 
               />
               ) 
            } 
            { label }
         </label>
         {
            input.error !== null && (
               <div className = "flex justify-center align-center text-center max-w-[90%] mx-auto gap-2 my-3 opacity-0 animate-fadeIn">
                  <p className = "text-red-500 font-bold input-error"> { input.error.trim() } </p>
               </div>
            )
         }
      </div>
   );
}