import { faCircleCheck, faCircleXmark, faEye, faEyeSlash, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ChangeEvent, Dispatch, useCallback, useEffect, useRef } from "react";

import Error from "@/components/global/error";
import { VitalityAction, VitalityInputState } from "@/lib/global/reducer";

export interface VitalityInputProps extends React.InputHTMLAttributes<any> {
   label: string;
   input: VitalityInputState;
   dispatch: Dispatch<VitalityAction<any>>;
   icon?: IconDefinition;
   onSubmit?: () => void;
   scrollIntoView?: boolean;
}

export function Input(props: VitalityInputProps): JSX.Element {
   const { id, label, type, icon, placeholder, className, min, autoFocus, scrollIntoView,
      autoComplete, onChange, onBlur, onSubmit, required, input, dispatch, disabled } = props;
   const inputType = input.data?.type ?? type;
   const inputRef = useRef<HTMLInputElement>(null);
   const passwordIconRef = useRef<SVGSVGElement | null>(null);

   useEffect(() => {
      autoFocus && inputRef.current?.focus();
      scrollIntoView && inputRef.current?.scrollIntoView({ behavior: "instant", block: "center" });
   }, [
      autoFocus,
      input.error,
      scrollIntoView
   ]);

   const inputChangeHandler = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      // handlesChanges defined implies state management is handled via the parent component
      if (input.handlesChanges) {
         onChange?.call(null, event);
      } else {
         dispatch({
            type: "updateState",
            value: {
               id: id,
               value: {
                  value: event.target.value,
                  error: null
               }
            }
         });
      }
   }, [
      id,
      input,
      onChange,
      dispatch
   ]);

   const keyDownHandler = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (inputRef.current && event.key === "Escape") {
         // Focus the top-most modal in the DOM when blurring input element, if applicable
         inputRef.current?.blur();

         const modals: HTMLCollection = document.getElementsByClassName("modal");

         if (modals.length > 0) {
            (modals.item(modals.length - 1) as HTMLDivElement).focus();
         }
      } else if (inputRef.current && event.key === "Enter") {
         // Call the relative form submission method, if any
         onSubmit?.call(null);
         inputRef.current?.blur();
      }
   }, [onSubmit]);

   const passwordIconHandler = useCallback(() => {
      inputRef.current?.focus();

      dispatch({
         type: "updateState",
         value: {
            id: id,
            value: {
               data: {
                  type: inputType === "password" ? "text" : "password"
               }
            }
         }
      });
   }, [
      id,
      dispatch,
      inputType
   ]);

   return (
      <div className = "relative">
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
                  clsx("peer block w-full overflow-hidden rounded-lg border bg-white px-4 pb-2 pt-7 text-sm font-semibold placeholder:text-transparent autofill:pb-2 autofill:pt-7 focus:border-[1.5px] focus:border-primary focus:pb-2 focus:pt-7 focus:ring-primary disabled:pointer-events-none disabled:opacity-50 xxsm:p-4 dark:border-0 dark:bg-gray-700/50 dark:[color-scheme:dark] [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-7",
                     {
                        "border-gray-200 border-[1.5px]": input.error === null,
                        "border-red-500 border-2 dark:border-2 focus:border-red-500 focus:ring-red-500 error": input.error !== null
                     }, className)
               }
               onKeyDown = { (event: React.KeyboardEvent<HTMLInputElement>) => keyDownHandler(event) }
               onChange = { (event: ChangeEvent<HTMLInputElement>) => inputChangeHandler(event) }
               onBlur = { onBlur ?? undefined }
               disabled = { disabled ?? false }
            />
            {
               (inputType === "password" || passwordIconRef.current !== null) && (
                  <button
                     tabIndex = { 0 }
                     onKeyDown = { (event: React.KeyboardEvent) => event.key === "Enter" && passwordIconHandler() }
                     type = "button"
                     className = "absolute end-0 top-1/2 -translate-y-1/2 rounded-e-md p-4"
                  >
                     <FontAwesomeIcon
                        ref = { passwordIconRef }
                        icon = { inputType == "password" ? faEye : faEyeSlash }
                        className = {
                           clsx("password-icon size-[0.95rem] shrink-0 xxsm:size-4", {
                              "text-primary" : input.data?.type && input.data?.type !== "password"
                           })
                        }
                        onClick = { passwordIconHandler }
                     />
                  </button>
               )
            }
            {
               input.data?.valid !== undefined && (
                  <button
                     tabIndex = { -1 }
                     type = "button"
                     className = "absolute end-0 top-1/2 -translate-y-1/2 rounded-e-md p-4"
                  >
                     <FontAwesomeIcon
                        icon = { input.data?.valid ? faCircleCheck : faCircleXmark }
                        className = {
                           clsx("size-[0.95rem] shrink-0 xxsm:size-4", {
                              "text-green-500": input.data?.valid,
                              "text-red-500": !(input.data?.valid)
                           })
                        }
                     />
                  </button>
               )
            }
            <label
               htmlFor = { id }
               className = {
                  clsx(
                     "pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-xs transition duration-200 ease-in-out peer-placeholder-shown:-translate-y-2 peer-focus:text-xs peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-xs xxsm:text-sm xxsm:peer-placeholder-shown:-translate-y-0 xxsm:peer-focus:-translate-y-2 dark:peer-placeholder-shown:text-white",
                     {
                        "font-bold": required,
                        "peer-[:not(:placeholder-shown)]:text-gray-500 dark:peer-[:not(:placeholder-shown)]:text-gray-400": input.value !== "",
                        "peer-placeholder-shown:text-black dark:peer-placeholder-shown:text-white": input.value === ""
                     }
                  )
               }
            >
               {
                  icon && (
                     <FontAwesomeIcon
                        icon = { icon }
                        className = "mr-[5px]"
                     />
                  )
               }
               { label }
            </label>
         </div>
         <Error message = { input.error } />
      </div>
   );
}