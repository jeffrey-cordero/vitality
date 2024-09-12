import clsx from "clsx";
import PopUp from "@/components/global/popup";
import Input, { InputProps } from "@/components/global/input";
import Button from "@/components/global/button";
import { faGear, faXmark, faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addWorkoutTag, Tag } from "@/lib/workouts/workouts";
import { AuthenticationContext } from "@/app/layout";
import { useContext, useMemo } from "react";

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

   // Simple search for tag based on starting with specific pattern
   return tags.filter(tag => tag.title.toLowerCase().startsWith(search));
}

function NewTagForm(props: InputProps, search: string, userId: string) {
   const handleSubmission = async () => {
      const tag: Tag = {
         userId: userId,
         title: search,
         color: "rgb(90, 90, 90)"
      };

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
                  options: [...props.input.data.options, tag],
                  selected: [...props.input.data.selected, tag]
               }
            }
         });
      }
   };

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
         <h1>Create <span className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: "rgb(90, 90, 90)" }}>{search}</span></h1>
      </div>
   );
}

function EditTagForm(props: InputProps, tag: Tag): JSX.Element {
   // Component list of limited colors for a given tag
   // const colorsList: JSX.Element[] = useMemo(() => {
   //    return colors.map((color: string, index: number) => {
   //       return (
   //          <div 
   //             style={{backgroundColor: color}}
   //             className={clsx("w-full h-[3rem]  border-[3px] rounded-sm p-3", {
   //                "border-primary scale-[1.02] text-white": props.input.data.editColor.value === color,
   //                "border-gray-200" : props.input.data.editColor.value !== color
   //             })}
   //             onClick={()=> {
   //                 // Update editing color value
   //                props.dispatch({
   //                   type: "updateInput",
   //                   value: {
   //                      ...props.input,
   //                      data: {
   //                         ...props.input.data,
   //                         editColor: {
   //                            ...props.input.data.editColor,
   //                            value: color
   //                         }
   //                      }
   //                   }
   //                });
   //             }} 
   //             key={index}>
   //          </div>
   //       )
   //    })
   // }, [props.input.data.editColor]);

   return (
      <div className="text-black">
         {/* Nested input props */}
         <Input
            input={props.input.data.editTitle} label="&#x1F58A; Title" dispatch={props.dispatch}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
               // Update editing title value
               props.dispatch({
                  type: "updateInput",
                  value: {
                     ...props.input,
                     data: {
                        ...props.input.data,
                        editTitle: {
                           ...props.input.data.editTitle,
                           value: event.target.value
                        }
                     }
                  }
               });
            }}
         />
         <div className="flex flex-col justify-center items-center gap-2 p-3">
            {
               colors.map((color: string, index: number) => {
                  return (
                     <div 
                        style={{backgroundColor: color}}
                        className={clsx("w-full h-[3rem]  border-[3px] rounded-sm p-3", {
                           "border-primary scale-[1.02] text-white": props.input.data.editColor.value === color,
                           "border-gray-200" : props.input.data.editColor.value !== color
                        })}
                        onClick={()=> {
                            // Update editing color value
                           props.dispatch({
                              type: "updateInput",
                              value: {
                                 ...props.input,
                                 data: {
                                    ...props.input.data,
                                    editColor: {
                                       ...props.input.data.editColor,
                                       value: color
                                    }
                                 }
                              }
                           });
                        }} 
                        key={index}>
                     </div>
                  )
               })
            }
         </div>
         <div>
            <Button 
               type = "submit" className = "bg-primary text-white w-full" icon = {faCloudArrowUp}
                  onClick={()=> {
                     alert(tag.id);
                  }}
               >
               Save
            </Button>
         </div>
      </div>
   );
}

function TagsItem(props: InputProps, tag: Tag, index: number, isSelected: boolean): JSX.Element {
   // Handle adding or removing a selected tag
   const handleOnClick = (adding: boolean) => {
      props.dispatch({
         type: "updateInput",
         value: {
            ...props.input,
            data: {
               ...props.input.data,
               // Add to selected options, if applicable, or remove
               selected: adding ? [...props.input.data.selected, tag] : props.input.data.selected.filter(o => o !== tag)
            }
         }
      });
   };

   return (
      <div
         className={clsx("px-3 py-1 m-2 rounded-full text-sm font-bold text-white transition duration-300 ease-in-out")}
         style={{
            backgroundColor: tag.color
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
               className="cursor-pointer max-w-2xl"
               cover={
                  <FontAwesomeIcon
                     icon={faGear}
                     onClick={() => {
                        // Update edit tag information state
                        props.dispatch({
                           type: "updateInput",
                           value: {
                              ...props.input,
                              data: {
                                 ...props.input.data,
                                 editTitle: {
                                    ...props.input.data.editTitle,
                                    value: tag.title
                                 },
                                 editColor: {
                                    ...props.input.data.editColor,
                                    value: tag.color
                                 }
                              }
                           }
                        });
                     }}
                     className="text-xs hover:scale-125 transition duration-300 ease-in-out"
                  />
               }
            >
               { EditTagForm(props, tag) }
            </PopUp>
            {
               isSelected &&
               <FontAwesomeIcon
                  onMouseDown={() => handleOnClick(false)}
                  icon={faXmark}
                  className="text-xs transition duration-300 ease-in-out hover:scale-125 hover:text-red-500"
               />
            }
         </div>
      </div>
   );
};

export default function TagSelection(props: InputProps): JSX.Element {
   // Store user and search pattern
   const { user } = useContext(AuthenticationContext);

   // Convert search string to lower case for case-insensitive comparison
   const search = useMemo(() => props.data?.search.toLowerCase(), [props.data?.search]);

   // Store overall and selected tags
   const options = useMemo(() => props.input.data.options, [props.input.data.options]);
   const selectedOptions = useMemo(() => props.input.data.selected, [props.input.data.selected]);

   // Differentiate between selected and unselected options
   const unselectedOptions = useMemo(() => new Set(selectedOptions), [selectedOptions]);
   const searchOptions = useMemo(() => options.filter(o => !unselectedOptions.has(o)), [options, unselectedOptions]);

   // Store selected based on title's
   const selectedTagsByTitle = useMemo(() => {
      const result: { [key: string]: Tag } = {};

      selectedOptions.forEach((tag: Tag) => {
         result[tag.title] = tag;
      });

      return result;
   }, [selectedOptions]);

   // Search results
   const results = useMemo(() => searchForTag(searchOptions, search), [searchOptions, search]);

   return (
      <div>
         <div id="search-results">
            {/* Selected; */}
            <ul className="flex flex-wrap justify-center items-center mb-8">
               {
                  selectedOptions.map((option: Tag, index: number) => {
                     return TagsItem(props, option, index, true);
                  })
               }
            </ul>
            {/* Unselected; */}
            <ul>
               {
                  results.length > 0 ? results.map((option: Tag, index: number) => {
                     return TagsItem(props, option, index, false);
                  }) : search.trim().length > 0 && user !== undefined && !(selectedTagsByTitle[search]) && NewTagForm(props, search, user.id)
               }
            </ul>
         </div>
      </div>
   );
}