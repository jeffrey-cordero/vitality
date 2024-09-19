import { VitalityInputProps } from "@/lib/global/state";
import clsx from "clsx";

function Options(): JSX.Element {
   return (
      <div>
      OPTIONS
      </div>
   );
}

export default function Select({ ...props }: VitalityInputProps): JSX.Element {
   return (

      <div className = "mt-2 p-2 w-full">
         <Options />
         <select name = "" id = "">
            {
               props.input.options?.map((option, index) => (
                  <option key = {index} value = {option}>Option - {index}</option>
               ))
            }
         </select>
         <label
            htmlFor = {props.input.id}
            className = {clsx("absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500", {
               "font-bold": props.label.includes("*")
            })}>
            {props.label}
         </label>
         {props.input.error !== null &&
            <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
               <p className = "text-red-500 font-bold input-error"> {props.input.error[0]} </p>
            </div>
         }
      </div>
   );
}