import clsx from "clsx";
import ToolTip from "@/components/global/tooltip";
import PopUp from "@/components/global/popup";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputProps } from "@/components/global/input";
import { addWorkoutTag, Tag } from "@/lib/workouts/workouts";
import { AuthenticationContext } from "@/app/layout";
import { useContext } from "react";

function searchForTag(tags: Tag[], search: string): Tag[] {
   // Handle no input for tag search
   if (search === "") {
      return Array.from(tags);
   }

   // Convert search string to lower case for case-insensitive comparison
   const searchLower = search.toLowerCase();

   // Simple search for tag based on starting with specific pattern
   return Array.from(tags).filter(tag => tag.title.toLowerCase().startsWith(searchLower));
}

function NewTagForm(props: InputProps, search: string, userId: string) {
   const handleSubmission = async () => {
      const tag: Tag = {
         userId: userId,
         title: search,
         color: "#e5e7eb"
      }

      const response = await addWorkoutTag(tag);

      if (!(response.status === "Success")) {
         // Display the respective error message
         props.dispatch({
            type: "updateStatus",
            value: response
         });
      } else {
         // Add the new tag (search pattern) to the overall user options
         props.dispatch({
            type: "updateInput",
            value: {
               ...props.input,
               error: null,
               data: {
                  ...props.input.data,
                  options: [...props.input.data?.options, tag]
               }
            }
         });
      }
   }

   return (
      <div
         tabIndex={0}
         className="cursor-pointer transition duration-300 ease-in-out hover:bg-gray-100 p-3 rounded-2xl"
         onClick={() => {
            handleSubmission();
         }}
         onKeyDown={(event) => {
            if (event.key === "Enter") {
               handleSubmission();
            }
         }
         }
      >
         <h1>Create <span className="inline-block px-3 py-1 rounded-full text-sm font-bold text-black bg-gray-200">{search}</span></h1>
      </div>
   )
}

function EditTagForm() {
   return (
      <div>
         HELLO WORLD
      </div>
   )
}

function TagsItem(props: InputProps, tag: Tag, index: number): JSX.Element {
   return (
      <div
         className={clsx("cursor-pointer px-3 py-1 m-2 rounded-full text-sm font-bold text-black transition duration-300 ease-in-out")}
         style={{
            backgroundColor: tag.color,
         }}
         key={index}
      >
         <div 
            className="flex justify-center items-center gap-3 p-1"
            onClick={()=> {
               // Add to selected options
               props.dispatch({
                  type: "updateInput",
                  value: {
                     ...props.input,
                     error: null,
                     data: {
                        ...props.input.data,
                        selected: [...props.input.data?.selected, tag]
                     }
                  }
               });

               console.log(props.input.data?.selected)

            }}
            >
            {tag.title}
            <PopUp
               className="max-w-2xl"
               cover= {
                  <FontAwesomeIcon 
                     icon={faGear} 
                     className="text-md hover:scale-[1.25] transition duration-300 ease-in-out"
                  />
               }
            >
               <div>HELLO WORLD</div>
         </PopUp>
         </div>
      </div>
   );
};

export default function TagSelection(props: InputProps): JSX.Element {
   const search = props.data?.search;
   const isValidSearch = search.trim().length > 0;
   const options = props.input.data?.options;
   const results: Tag[] = searchForTag(options, search);
   const { user } = useContext(AuthenticationContext);

   return (
      <div>
         <div id="search-results">
            {/* flex flex-wrap gap-2 justify-center items-center */}
            <ul className=" text-sm m-2 text-gray-700" aria-labelledby="dropdownSearchButton">
               {
                  results.length > 0 ? results.map((option: Tag, index: number) => {
                     return TagsItem(props, option, index);
                  }) : isValidSearch && user !== undefined && NewTagForm(props, search, user.id)
               }
            </ul>
         </div>
      </div>
   )
}