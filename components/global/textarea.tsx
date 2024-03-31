import { ChangeEvent, useRef } from "react";
import { InputFormat } from "@/lib/definitions";


export default function TextArea(representation: InputFormat<Object>): JSX.Element {
   const textArea = useRef<HTMLTextAreaElement | null>(null);

   const handleTextAreaOverflow = () => {
      const textarea = textArea.current;
      if (textarea) {
         textarea.style.height = 'auto';
         textarea.style.height = `${textarea.scrollHeight}px`;
      }
   };

   return (
      <div className="relative">
         <textarea
            data-state={representation.state}
            ref={textArea}
            id={representation.inputId}
            className="peer p-4 block w-full bg-white border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2 min-h-[10rem] h-auto bg-transparent"
            placeholder=""
            onChange={(event: ChangeEvent<HTMLTextAreaElement>)=> {
               representation.onChange(event);
               handleTextAreaOverflow();
            }}/>
         <label
            htmlFor={representation.inputId}
            className="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500">
            {representation.label}
         </label>
      </div>
   );
}