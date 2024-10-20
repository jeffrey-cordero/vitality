"use client";
import clsx from "clsx";
import { ChangeEvent, useCallback } from "react";
import { VitalityInputProps } from "@/components/global/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Select(props: VitalityInputProps): JSX.Element {
   const { label, icon, input, placeholder, dispatch, onChange } = props;
   const options: string[] = input.data.options;

   const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
      if (input.data.handlesChanges !== undefined) {
         // Call the user-defined event handler (complex state)
         onChange?.call(null, event);
      } else {
         // Simple state
         dispatch({
            type: "updateState",
            value: {
               ...input,
               value: event.target.value,
               error: null
            }
         });
      }
   }, [dispatch, input,  onChange]);

   return (
      <div className = "relative">
         <select
            id = {input.id}
            placeholder = {placeholder ?? ""}
            value = {input.value}
            className = {clsx("peer p-4 block w-full rounded-lg text-sm font-semibold border-1 placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2",
               {
                  "border-gray-200": input.error === null,
                  "border-red-500 ": input.error !== null
               }, props.className)}
            onChange = {(event: ChangeEvent<HTMLSelectElement>) => {handleSelectChange(event);}}
         >
            { options.map((option: string) => {
               return (
                  <option key = {option}> { option } </option>
               );
            })}
         </select>
         <label
            htmlFor = {input.id}
            className = {clsx("absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500", {
               "font-bold": label.includes("*")
            })}>
            { icon && <FontAwesomeIcon icon = {icon} /> } { label }
         </label>
         {input.error !== null &&
            <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
               <p className = "text-red-500 font-bold input-error"> {input.error} </p>
            </div>
         }
      </div>
   );
}