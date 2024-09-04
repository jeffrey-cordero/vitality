import clsx from "clsx";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputProps } from "@/components/global/input";
import { useEffect } from "react";

function Tag(props: InputProps, tag: string, color: string): JSX.Element {
   return (
      <div
         onClick={() => {
            props.dispatch({
               type: "updateInput",
               value: {
                  ...props.input,
                  value: props.input.value.add(tag),
                  error: null,
               }
            });
         }}
         className={clsx("cursor-pointer inline-block px-3 py-1 mr-2 mb-2 rounded-full text-sm bg-gray-200 text-gray-800", {
            "bg-blue-500 text-white": props.input.value.contains(tag),
         })}
      >

      </div>
   );
};

function TagsForm(props: InputProps): JSX.Element {
   return (
      <div>
         {/* {
            props.input.options && [...props.input.options].map((option, index) => {
               return (
               
               <div>

               </div>)
            })
         } */}

         <div id="dropdownSearch">
            <div>
               <label htmlFor="input-group-search" className="sr-only">Search</label>
               <div className="relative">
                  <div className="absolute inset-y-0 w-full rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                     <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </div>
                  <input type="text" id="input-group-search" className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" placeholder="Search for Workout Tags" />
               </div>
            </div>
            <ul className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700" aria-labelledby="dropdownSearchButton">
               <li className="cursor-pointer">
                  <div className="flex items-center ps-2 rounded hover:bg-gray-100">
                     <input id="checkbox-item-11" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                     <label htmlFor="checkbox-item-11" className="w-full py-2 ms-2 text-sm font-medium text-gray-900 rounded">Bonnie Green</label>
                  </div>
               </li>
               <li className="cursor-pointer">
                  <div className="flex items-center ps-2 rounded hover:bg-gray-100 cursor-pointer">
                     <input id="checkbox-item-12" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                     <label htmlFor="checkbox-item-12" className="w-full py-2 ms-2 text-sm font-medium text-gray-900 rounded">Jese Leos</label>
                  </div>
               </li>
            </ul>
         </div>
      </div>
   )
}

export default function Tags(props: InputProps): JSX.Element {
   useEffect(() => {
      if (props.input.value === "") {
         // Create the set values type
         props.dispatch({
            type: "updateInput",
            value: {
               ...props.input,
               value: new Set([]),
               error: null,
            }
         });
      }
   }, []);

   return (
      <div>
         <TagsForm {...props} />
      </div>
   )
}