"use client";
import clsx from "clsx";
import { ChangeEvent, useCallback, useEffect, useRef } from "react";
import { VitalityInputProps } from "@/components/global/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SelectProps extends VitalityInputProps {
  values: any[];
}

export default function Select(props: SelectProps): JSX.Element {
   const { id, label, value, values, icon, placeholder, className,
      onChange, autoFocus, required, input, dispatch } = props;
   const selectRef = useRef<HTMLSelectElement>(null);

   useEffect(() => {
      autoFocus && selectRef.current?.focus();
   }, [
      autoFocus,
      input.error
   ]);

   const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
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

   return (
      <div className = "relative">
         <select
            ref = { selectRef }
            id = { id }
            value = { value ?? input.value }
            placeholder = { placeholder ?? "" }
            className = {
               clsx("peer p-4 block w-full rounded-lg text-sm font-semibold border-1 dark:border-0 placeholder:text-transparent bg-white dark:bg-gray-700/50 focus:border-blue-500 focus:border-[1.5px] focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-7 focus:pb-2 [&:not(:placeholder-shown)]:pt-7 [&:not(:placeholder-shown)]:pb-2 autofill:pt-7 autofill:pb-2 dark:[color-scheme:dark]",
                  className,
               )
            }
            onChange = { handleSelectChange }>
            {
               values.map((value: string) => {
                  return (
                     <option key = { value }>
                        { value }
                     </option>
                  );
               })
            }
         </select>
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