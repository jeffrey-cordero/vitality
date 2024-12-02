"use client";
import clsx from "clsx";
import { ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import { VitalityInputProps } from "@/components/global/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function TextArea(props: VitalityInputProps): JSX.Element {
   const { id, label, icon, onChange, placeholder, required, autoFocus, input, dispatch } =
    props;
   const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
   const [visible, setVisible] = useState<boolean>(false);

   useEffect(() => {
      autoFocus && textAreaRef.current?.focus();
   }, [
      autoFocus,
      input.error
   ]);

   const handleTextAreaChange = useCallback(
      (event: ChangeEvent<HTMLTextAreaElement>) => {
         if (input.handlesOnChange) {
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

         handleTextAreaOverflow();
      }, [
         dispatch,
         input,
         id,
         onChange
      ]);

   const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
         if (textAreaRef.current && event.key === "Escape") {
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
      // On mounting, handle overflow for large input values
      if (!visible) {
         handleTextAreaOverflow();
         setVisible(true);
      }
   }, [visible]);

   return (
      <div className = "relative">
         <textarea
            id = { id }
            value = { input.value }
            placeholder = { placeholder ?? "" }
            className = {
               clsx(
                  "peer p-4 block w-full rounded-lg text-sm font-semibold border-1 dark:border-0 placeholder:text-transparent bg-white dark:bg-gray-700/50 focus:border-blue-500 focus:border-[1.5px] focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-7 focus:pb-2 [&:not(:placeholder-shown)]:pt-7 [&:not(:placeholder-shown)]:pb-2 autofill:pt-7 autofill:pb-2 dark:[color-scheme:dark] min-h-[15rem] h-auto bg-transparent resize-none overflow-hidden",
                  {
                     "border-gray-200": input.error === null,
                     "border-red-500 ": input.error !== null
                  },
               )
            }
            onKeyDown = {
               (event: React.KeyboardEvent<HTMLTextAreaElement>) =>
                  handleKeyDown(event)
            }
            onChange = {
               (event: ChangeEvent<HTMLTextAreaElement>) =>
                  handleTextAreaChange(event)
            }
            ref = { textAreaRef }
         />
         <label
            htmlFor = { id }
            className = {
               clsx(
                  "absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-black peer-placeholder-shown:text-sm peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-black dark:peer-placeholder-shown:text-white peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500 dark:peer-[:not(:placeholder-shown)]:text-gray-400",
                  {
                     "font-bold": required
                  },
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
               <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                  <p className = "text-red-500 font-bold input-error"> { input.error } </p>
               </div>
            )
         }
      </div>
   );
}