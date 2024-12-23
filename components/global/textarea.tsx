"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ChangeEvent, useCallback, useEffect, useRef } from "react";

import { VitalityInputProps } from "@/components/global/input";

export default function TextArea(props: VitalityInputProps): JSX.Element {
   const { id, label, icon, onChange, placeholder, required, autoFocus,
      input, dispatch } = props;
   const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

   useEffect(() => {
      autoFocus && textAreaRef.current?.focus();
   }, [
      autoFocus,
      input.error
   ]);

   const handleTextAreaChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
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

      handleTextAreaOverflow();
   }, [
      dispatch,
      input,
      id,
      onChange
   ]);

   const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (textAreaRef.current && event.key === "Escape") {
         // Focus the top-most modal in the DOM when blurring input element, if applicable
         textAreaRef.current.blur();

         const modals: HTMLCollection = document.getElementsByClassName("modal");

         if (modals.length > 0) {
            // Focus the most inner modal, if any
            (modals.item(modals.length - 1) as HTMLDivElement).focus();
         }
      }
   }, []);

   const handleTextAreaOverflow = () => {
      const textarea = textAreaRef.current;

      if (textarea) {
         textarea.style.height = "auto";
         textarea.style.height = `${textarea.scrollHeight}px`;
      }
   };

   useEffect(() => {
      // Handle overflow for large values during the initial render
      handleTextAreaOverflow();
   }, []);

   return (
      <div className = "relative">
         <textarea
            id = { id }
            value = { input.value }
            placeholder = { placeholder ?? "" }
            className = {
               clsx(
                  "peer block h-auto min-h-60 w-full resize-none overflow-hidden rounded-lg border bg-white px-4 pb-2 pt-7 text-sm font-semibold placeholder:text-transparent autofill:pb-2 autofill:pt-7 focus:border-[1.5px] focus:border-primary focus:pb-2 focus:pt-7 focus:ring-primary disabled:pointer-events-none disabled:opacity-50 xxsm:p-4 dark:border-0 dark:bg-gray-700/50 dark:[color-scheme:dark] [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-7",
                  {
                     "border-gray-200": input.error === null,
                     "border-red-500 ": input.error !== null
                  },
               )
            }
            onKeyDown = { (event: React.KeyboardEvent<HTMLTextAreaElement>) => handleKeyDown(event) }
            onChange = { (event: ChangeEvent<HTMLTextAreaElement>) => handleTextAreaChange(event) }
            ref = { textAreaRef }
         />
         <label
            htmlFor = { id }
            className = {
               clsx(
                  "pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-xs transition duration-200 ease-in-out peer-placeholder-shown:-translate-y-2 peer-placeholder-shown:text-black peer-focus:text-xs peer-focus:text-black peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500 xxsm:text-sm xxsm:peer-placeholder-shown:-translate-y-0 xxsm:peer-focus:-translate-y-2 dark:peer-placeholder-shown:text-white dark:peer-[:not(:placeholder-shown)]:text-gray-400",
                  {
                     "font-bold": required
                  },
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
               <div className = "mx-auto flex max-w-[90%] animate-fadeIn items-center justify-center gap-2 p-3 opacity-0">
                  <p className = "input-error font-bold text-red-500"> { input.error } </p>
               </div>
            )
         }
      </div>
   );
}