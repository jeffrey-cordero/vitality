import clsx from "clsx";
import PopUp from "@/components/global/popup";
import { faGear, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputProps } from "@/components/global/input";
import { addWorkoutTag, Tag } from "@/lib/workouts/workouts";
import { AuthenticationContext } from "@/app/layout";
import { useContext, useState } from "react";

const colors = [
   "rgb(55, 55, 55)", "rgb(90, 90, 90)", "rgb(96, 59, 44)", "rgb(133, 76, 29)",
   "rgb(131, 94, 51)", "rgb(43, 89, 63)", "rgb(40, 69, 108)", "rgb(73, 47, 100)",
   "rgb(105, 49, 76)", "rgb(110, 54, 48)"
];

function searchForTag(tags: Tag[], search: string): Tag[] {
   // Handle no input for tag search
   if (search === "") {
      return tags;
   }

   // Convert search string to lower case for case-insensitive comparison
   const searchLower = search.toLowerCase();

   // Simple search for tag based on starting with specific pattern
   return tags.filter(tag => tag.title.toLowerCase().startsWith(searchLower));
}

function NewTagForm(props: InputProps, search: string, userId: string) {
   const handleSubmission = async () => {
      const tag: Tag = {
         userId: userId,
         title: search,
         color: "rgb(90, 90, 90)"
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
               data: {
                  ...props.input.data,
                  options: new Set(props.input.data?.options).add(tag),
                  selected: new Set(props.input.data?.selected).add(tag)
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
         <h1>Create <span className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white" style={{backgroundColor: "rgb(90, 90, 90)"}}>{search}</span></h1>
      </div>
   )
}

function EditTagForm(): JSX.Element {
   return (
      <div className="text-black">
         Will edit this workout tag...
      </div>
   )
}

function TagsItem(props: InputProps, tag: Tag, index: number, isSelected: boolean): JSX.Element {
   const [isHovering, setIsHovering] = useState<boolean>(false);

   // Handle adding or removing a selected tag
   const handleOnClick = (adding: boolean) => {
      const newSelected = new Set(props.input.data?.selected);

      if (adding) {
         newSelected.add(tag);
      } else {
         newSelected.delete(tag);
      }

      props.dispatch({
         type: "updateInput",
         value: {
            ...props.input,
            data: {
               ...props.input.data,
               // Add to selected options, if applicable
               selected: newSelected,
            }
         }
      });

      console.log(props.input.data?.selected);
   }

   return (
      <div
         className={clsx("cursor-pointer px-3 py-1 m-2 rounded-full text-sm font-bold text-white transition duration-300 ease-in-out")}
         style={{
            backgroundColor: tag.color,
         }}
         key={index}
      >
         <div
            className="flex justify-center items-center gap-3 p-1"
            onClick={() => {
               if (!(isSelected)) {
                  handleOnClick(true);
               }
            }}
         >
            {/* Display pop up displaying entire title for readability */}
            {tag.title}
            <PopUp
               className="max-w-2xl"
               cover={
                  <FontAwesomeIcon
                     icon={faGear}
                     className="text-xs hover:scale-125 transition duration-300 ease-in-out"
                  />
               }
            >
               <EditTagForm />
            </PopUp>
            {
               isSelected &&
                  <FontAwesomeIcon
                     onMouseEnter={() => setIsHovering(true)}
                     onMouseLeave={() => setIsHovering(false)}
                     onMouseDown={()=> handleOnClick(false)}
                     icon={isHovering ? faXmark : faCheck}
                     className={clsx("text-xs transition duration-300 ease-in-out", {
                        "scale-125 text-red-500": isHovering
                     })}
                  />
            }
         </div>
      </div>
   );
};

export default function TagSelection(props: InputProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const search: string = props.data?.search;
   const isValidSearch: boolean = search.trim().length > 0;

   // Store set of options, selected, and Array of unselected Tags for front-end rendering
   const options: Set<Tag> = props.input.data?.options;
   const selected: Set<Tag> = props.input.data?.selected;
   const unselected: Tag[] = Array.from(options).filter(o => !(selected.has(o)));

   // Store selected tags by title and search results based on pattern
   const selectedTagsByTitle: { [key: string]: Tag } = {};
   const results: Tag[] = searchForTag(unselected, search);

   return (
      <div>
         <div id="search-results">
            {/* Selected; */}
            <ul className="flex flex-wrap justify-center items-center mb-8">
               {
                  Array.from(selected).map((option: Tag, index: number) => {
                     selectedTagsByTitle[option.title] = option;
                     return TagsItem(props, option, index, true);
                  })
               }
            </ul>
            {/* Unselected; */}
            <ul>
               {
                  results.length > 0 ? results.map((option: Tag, index: number) => {
                     return TagsItem(props, option, index, false);
                  }) : isValidSearch && user !== undefined && !(selectedTagsByTitle[search]) && NewTagForm(props, search, user.id)
               }
            </ul>
         </div>
      </div>
   )
}