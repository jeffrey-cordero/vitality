"use client";
import clsx from "clsx";
import { ChangeEvent, useRef } from "react";
import { InputState, FormItems } from "@/lib/form";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Updater } from "use-immer";

const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setInputs: Updater<FormItems>) => {
   const { id, value } = event.target;

   setInputs((input: { [key: string]: InputState; }) => {
      input[id].value = value;
      input[id].error = null;
   });
};

export function Input ({ input, setInputs } : {input: InputState, setInputs: Updater<FormItems>}): JSX.Element {
   const eyeButton = useRef<SVGSVGElement | null>(null);

   return (
      <div className = "relative">
         <input
            type = {input.type}
            id = {input.id}
            value = {input.value}
            className = {clsx("peer p-4 block w-full rounded-lg text-sm font-semibold border-1 placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2",
               {
                  "border-gray-200": input.error === null,
                  "border-red-500": input.error !== null,
               })}
            placeholder = ""
            onChange = {(event: ChangeEvent<HTMLInputElement>) => {
               handleChange(event, setInputs);
            }}
         />
         {input.isPassword &&
            <button type = "button" className = "absolute top-0 end-0 p-3.5 rounded-e-md">
               <FontAwesomeIcon
                  icon = {faEye}
                  className = "flex-shrink-0 size-3.5"
                  ref = {eyeButton}
                  onClick = {() => {
                     if (eyeButton.current !== null) {
                        eyeButton.current.style.color = input.type === "password" ? "blue" : "black";

                        setInputs( (inputs: FormItems) => {
                           inputs[input.id].type = input.type === "password" ? "text" : "password";
                        });
                     }
                  }} />
            </button>
         }

         <label
            htmlFor = {input.id}
            className = {clsx("absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500", {
               "font-bold" : input.label.includes("*")
            })}>
            {input.label}
         </label>
         {input.error !== null &&
            <div className = "flex justify-center align-center gap-2 p-3 opacity-0 animate-fadeIn">
               <ExclamationCircleIcon className = "h-5 w-5 mt-[2px] text-red-500" />
               <p className = "text-red-500"> {input.error} </p>
            </div>
         }
      </div>
   );
}

export function TextArea ({ input, setInputs } : {input: InputState, setInputs: Updater<FormItems>}): JSX.Element {
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
            id = {input.id}
            value = {input.value}
            className = {clsx("peer p-4 block w-full bg-white border-1 border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2 min-h-[12rem] h-auto bg-transparent resize-none",
               {
                  "border-gray-200": input.error === null,
                  "border-red-500 ": input.error !== null,
               })}
            placeholder = ""
            onChange = {(event: ChangeEvent<HTMLTextAreaElement>) => {
               handleChange(event, setInputs);
               handleTextAreaOverflow();
            }}
            ref = {textArea}
         />
         <label
            htmlFor = {input.id}
            className = {clsx("absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500", {
               "font-bold" : input.label.includes("*")
            })}>
            {input.label}
         </label>
         {input.error !== null &&
            <div className = "flex justify-center align-center gap-2 p-3 opacity-0 animate-fadeIn">
               <ExclamationCircleIcon className = "h-5 w-5 mt-[2px] text-red-500" />
               <p className = "text-red-500 "> {input.error} </p>
            </div>
         }
      </div>
   );
}