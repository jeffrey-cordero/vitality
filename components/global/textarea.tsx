"use client";
import clsx from "clsx";
import { ChangeEvent, useRef } from "react";
import { InputProps, updateFormState } from "@/lib/global/form";

export default function TextArea({ updater, ...props }: InputProps): JSX.Element {
   const textArea = useRef<HTMLTextAreaElement | null>(null);

   const handleTextAreaOverflow = () => {
      const textarea = textArea.current;
      if (textarea) {
         textarea.style.height = "auto";
         textarea.style.height = `${textarea.scrollHeight}px`;
      }
   };

   return (
      <div className = "relative">
         <textarea
            id = {props.input.id}
            value = {props.input.value}
            className = {clsx("peer p-4 block w-full bg-white border-1 border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2 min-h-[12rem] h-auto bg-transparent resize-none",
               {
                  "border-gray-200": props.input.error === null,
                  "border-red-500 ": props.input.error !== null
               })}
            onChange = {(event: ChangeEvent<HTMLTextAreaElement>) => {
               updateFormState(event, updater);
               handleTextAreaOverflow();
            }}
            ref = {textArea}
         />
         <label
            htmlFor = {props.input.id}
            className = {clsx("absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500", {
               "font-bold": props.input.label.includes("*")
            })}>
            {props.input.label}
         </label>
         {props.input.error !== null &&
            <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
               <p className = "text-red-500 input-error"> {props.input.error} </p>
            </div>
         }
      </div>
   );
}