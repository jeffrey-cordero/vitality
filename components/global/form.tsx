'use client';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { InputState } from '@/lib/form';
import clsx from 'clsx';

export const useFormInput = (initial: any) =>  {
   const [value, setValue] = useState(initial);
   const [error, setError] = useState<string | null>(null);
 
   const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     setValue(event.target.value);
     setError(null);
   };
 
   return {
     value,
     onChange: handleChange,
     setError,
     error
   };
}; 

export function Input(representation: InputState): JSX.Element {
   return (
      <div className='relative'>
         <input
            value={representation.value}
            type={representation.inputType}
            id={representation.inputId}
            className={clsx('peer p-4 block w-full rounded-lg text-sm font-semibold border-2 placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2',
               {
                  'border-gray-200': representation.error === null,
                  'border-red-500': representation.error !== null,
               })}
            placeholder=''
            onChange={representation.onChange}
         />
         <label
            htmlFor={representation.inputId}
            className='absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500'>
            {representation.label}
         </label>
         {representation.error !== null &&
            <div className='flex justify-center align-center gap-2 p-3 opacity-0 animate-fadein'>
               <p className='text-red-500'> {representation.error} </p>
            </div>
         }
      </div>
   );
}

export function TextArea(representation: InputState): JSX.Element {
   const textArea = useRef<HTMLTextAreaElement | null>(null);

   const handleTextAreaOverflow = () => {
      const textarea = textArea.current;

      if (textarea) {
         textarea.style.height = `${textarea.scrollHeight}px`;
      }
   }; 

   return (
      <div className='relative'>
         <textarea
            value={representation.value}
            id={representation.inputId}
            className={clsx('peer p-4 block w-full bg-white border-2 border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2 min-h-[10rem] h-auto bg-transparent',
               {
                  'border-gray-200': representation.error === null,
                  'border-red-500 ': representation.error !== null,
               })}
            placeholder=''
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
               handleTextAreaOverflow();
               representation.onChange(event);
            }} 
            ref={textArea}
            />
         <label
            htmlFor={representation.inputId}
            className='absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-200 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-2 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-gray-500'>
            {representation.label}
         </label>
         {representation.error !== null &&
            <div className='flex justify-center align-center gap-2 p-3 opacity-0 animate-fadein'>
               <p className='text-red-500 '> {representation.error} </p>
            </div>
         }
      </div>
   );
}