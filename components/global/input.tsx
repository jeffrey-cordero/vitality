import clsx from "clsx";
import Button from "@/components/global/button";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      autoComplete, onChange, onBlur, onSubmit, required, input, dispatch, disabled } = props;
   const inputType = input.data.type ?? type;
   const inputRef = useRef<HTMLInputElement>(null);
   const passwordIconRef = useRef<SVGSVGElement | null>(null);

   useEffect(() => {
      autoFocus && inputRef.current?.focus();
      scrollIntoView && inputRef.current?.scrollIntoView({ behavior: "instant", block: "center" });
   }, [
      autoFocus,
      scrollIntoView,
      input.error
   ]);

   const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      // handlesOnChange defined implies state management is handled via the parent component
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
         // Focus the top-most modal in the DOM when blurring input element, if applicable
         inputRef.current?.blur();

         const modals: HTMLCollection = document.getElementsByClassName("modal");

         if (modals.length > 0) {
            (modals.item(modals.length - 1) as HTMLDivElement).focus();
         }
      } else if (inputRef.current && event.key === "Enter") {
         // Call the relative form submission method, if any
         onSubmit?.call(null);
      }
   }, [onSubmit]);

   const handlePasswordIconClick = useCallback(() => {
      inputRef.current?.focus();

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
               onKeyDown = { (event: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(event) }
               onChange = { (event: ChangeEvent<HTMLInputElement>) => handleInputChange(event) }
               onBlur = { onBlur ?? undefined }
               disabled = { disabled ?? false }
            />
            {
               (inputType === "password" || passwordIconRef.current !== null) && (
                  <Button
                     tabIndex = { -1 }
                     type = "button"
                     className = "absolute end-0 top-1/2 -translate-y-1/2 rounded-e-md p-4"
                  >
                     <FontAwesomeIcon
                        ref = { passwordIconRef }
                        icon = { inputType == "password" ? faEye : faEyeSlash }
                        className = {
                           clsx("password-icon size-[0.95rem] shrink-0 xxsm:size-4", {
                              "text-primary" : input.data.type && input.data.type !== "password"
                           })
                        }
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
                     className = "absolute end-0 top-1/2 -translate-y-1/2 rounded-e-md p-4"
                  >
                     <FontAwesomeIcon
                        icon = { input.data.valid ? faCircleCheck : faCircleXmark }
                        className = {
                           clsx("size-[0.95rem] shrink-0 xxsm:size-4", {
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
         {
            input.error !== null && (
               <div className = "relative mx-auto my-3 flex animate-fadeIn items-center justify-center gap-2 px-2 text-center text-base opacity-0">
                  <p className = "input-error font-bold text-red-500">
                     { input.error.trim() }
                  </p>
               </div>
            )
         }
      </div>
   );
}