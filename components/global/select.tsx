"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ChangeEvent, useCallback, useEffect, useRef } from "react";

import { VitalityInputProps } from "@/components/global/input";

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
               clsx("peer block w-full rounded-lg border-gray-200 bg-white p-4 text-sm font-semibold placeholder:text-transparent autofill:pb-2 autofill:pt-7 focus:border-[1.5px] focus:border-primary focus:pb-2 focus:pt-7 focus:ring-primary disabled:pointer-events-none disabled:opacity-50 dark:border-0 dark:bg-gray-700/50 dark:[color-scheme:dark] [&:not(:placeholder-shown)]:pb-2 [&:not(:placeholder-shown)]:pt-7",
                  className,
               )
            }
            onChange = { handleSelectChange }
         >
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
                  "pointer-events-none absolute start-0 top-0 h-full truncate border border-transparent p-4 text-sm transition duration-200 ease-in-out peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-placeholder-shown:text-black peer-focus:-translate-y-2 peer-focus:text-xs peer-focus:text-black peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500 dark:peer-placeholder-shown:text-white dark:peer-[:not(:placeholder-shown)]:text-gray-400",
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