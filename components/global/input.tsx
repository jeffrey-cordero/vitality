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
               clsx("peer block w-full rounded-lg border bg-white p-4 text-sm font-semibold placeholder:text-transparent autofill:pb-2 autofill:pt-7 focus:border-[1.5px] focus:border-blue-500 focus:pb-2 focus:pt-7 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-0 dark:bg-gray-700/50 dark:[color-scheme:dark] [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-7",
                  {
                     "border-gray-200 border-[1.5px]": input.error === null,
                     "border-red-500 border-2 dark:border-2 focus:border-red-500 focus:ring-red-500 error": input.error !== null
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
                  className = "absolute end-0 top-[5px]   rounded-e-md p-3.5"
               >
                  <FontAwesomeIcon
                     icon = { inputType == "password" ? faEye : faEyeSlash }
                     className = "password-icon size-4 shrink-0"
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
                  className = "absolute end-0 top-[5px] rounded-e-md p-3.5"
               >
                  <FontAwesomeIcon
                     icon = { input.data.valid ? faCircleCheck : faCircleXmark }
                     className = {
                        clsx("size-4 shrink-0", {
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
                  "pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-200 ease-in-out peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-placeholder-shown:text-black peer-focus:-translate-y-2 peer-focus:text-xs peer-focus:text-black peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500 dark:peer-placeholder-shown:text-white dark:peer-[:not(:placeholder-shown)]:text-gray-400",
                  {
                     "font-bold": required,
                     "dark:peer-[:not(:placeholder-shown)]:text-white" : type === "date" && input.value === "",
                     "dark:peer-[:not(:placeholder-shown)]:text-gray-400" : type === "date" && input.value !== ""
                  }
               )
            }
         >
            {
               icon && (
                  <FontAwesomeIcon
                     icon = { icon }
                     className = "mr-[4px]"
                  />
               )
            }
            { label }
         </label>
         {
            input.error !== null && (
               <div className = "mx-auto my-3 flex max-w-[90%] animate-fadeIn items-center justify-center gap-2 text-center text-sm opacity-0">
                  <p className = "input-error font-bold text-red-500"> { input.error.trim() } </p>
               </div>
            )
         }
      </div>
   );
}