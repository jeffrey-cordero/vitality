import clsx from "clsx";
import PopUp from "@/components/global/popup";
import Input, { InputProps } from "@/components/global/input";
import Button from "@/components/global/button";
import Notification from "@/components/global/notification";
import { faGear, faXmark, faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addWorkoutTag, Tag, updateWorkoutTag } from "@/lib/workouts/workouts";
import { AuthenticationContext } from "@/app/layout";
import { useContext, useEffect, useMemo } from "react";
import { FormResponse } from "@/lib/global/form";

const colors = {
   "Light gray": "rgb(55, 55, 55)",
   "Gray": "rgb(90, 90, 90)",
   "Brown": "rgb(96, 59, 44)",
   "Orange": "rgb(133, 76, 29)",
   "Yellow": "rgb(131, 94, 51)",
   "Green": "rgb(43, 89, 63)",
   "Blue": "rgb(40, 69, 108)",
   "Purple": "rgb(73, 47, 100)",
   "Pink": "rgb(105, 49, 76)",
   "Red": "rgb(110, 54, 48)"
};

// Store selected based on title's
const tagsByTitle: { [title: string]: Tag } = {};

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
         user_id: userId,
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
   const handleSubmission = async() => {
      const payload: Tag = {
         user_id: tag.user_id,
         id: tag.id,
         title: props.input.data.editTitle.value,
         color: props.input.data.editColor.value,
      };

      const response: FormResponse = await updateWorkoutTag(payload);

      if (response.status !== "Success") {
         // Add respective errors, if any
         props.dispatch({
            type: "updateInput",
            value: {
               ...props.input,
               data: {
                  ...props.input.data,
                  editTitle: {
                     ...props.input.data.editTitle,
                     error: response.body.errors["title"] ?? null
                  },
                  editColor: {
                     ...props.input.data.editColor,
                     error: response.body.errors["color"] ?? null
                  }
               }
            }
         });
      } else {
         // Display simple success message and update in memory tag
         if (props.state !== undefined) {
            props.dispatch({
               type: "updateFormState",
               value: {
                  status: "Success",
                  inputs: {
                     ...props.state.inputs,
                     tags: {
                        ...props.state.inputs.tags,
                        data: {
                           ...props.state.inputs.tags.data,
                           options: props.state.inputs.tags.data.options.map((tag: Tag) => {
                              return tag.id === payload.id ? payload : tag;
                           }),
                           selected: props.state.inputs.tags.data.selected.map((tag: Tag) => {
                              return tag.id === payload.id ? payload : tag;
                           })
                        }
                     }
                  },
                  response: response
               }
            });
         }
      }

   };

   return (
      <div className="flex flex-col justify-center align-center text-center gap-3 text-black">
         <div className = "flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon = {faGear}
               className = "text-6xl text-primary mt-1"
            />
            <h1 className = "text-3xl font-bold text-black mb-2">
               Edit Workout Tag
            </h1>
         </div>
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
                           value: event.target.value,
                           error: null
                        }
                     }
                  }
               });
            }}
         />
         <div className="flex flex-col justify-center items-center gap-2">
            {
               Object.keys(colors).map((name: string, index: number) => {
                  const color: string = colors[name];

                  return (
                     <div 
                        style={{backgroundColor: color}}
                        className={clsx("w-full h-[3rem]  border-[3px] rounded-sm p-3 text-white text-center", {
                           "border-primary scale-[1.02]": props.input.data.editColor.value === color,
                           "border-white" : props.input.data.editColor.value !== color
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
                        key={name+index}>
                        {name}
                     </div>
                  )
               })
            }
            {/* Potential error message for invalid color in payload */}
            {props.input.data.editColor.error !== null &&
               <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                  <p className = "text-red-500 font-bold input-error"> {props.input.data.editColor.error[0]} </p>
               </div>
            }
         </div>
         <div>
            <Button 
               type = "submit" className = "bg-primary text-white w-full" icon = {faCloudArrowUp}
                  onClick={() => handleSubmission()}
               >
               Save
            </Button>
         </div>
         {
            (props.state?.status === "Success" || props.state?.status === "Failure") && (
               <Notification state = {props.state} />
            )
         }
      </div>
   );
}

// Need to trigger re-render on change on props.input.tags.options-> < Array> on change for current tag param
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
               selected: adding ? [...props.input.data.selected, tag] : props.input.data.selected.filter((other: Tag) => (other) !== tag)
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
         key={JSON.stringify(tag)}
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
   const search = props.state?.inputs.search.value.toLowerCase();

   // Store overall and selected tags
   const options = useMemo(() => props.input.data.options, [JSON.stringify(props.input.data.options)]);
   const selectedOptions = useMemo(() => props.input.data.selected, [JSON.stringify(props.input.data.selected)]);


   // Differentiate between selected and unselected options
   const unselectedOptions = new Set(selectedOptions);
   const searchOptions = options.filter((tag: Tag) => !(unselectedOptions.has(tag)));

   // Search results
   const results = searchForTag(searchOptions, search);

   return (
      <div>
         <div id="search-results">
            {/* Selected; */}
            <ul className="flex flex-wrap justify-center items-center mb-8">
               {
                  selectedOptions.map((tag: Tag, index: number) => {
                     tagsByTitle[tag.title] = tag;
                     return TagsItem(props, tag, index, true);
                  })
               }
            </ul>
            {/* Unselected; */}
            <ul>
               {
                  results.length > 0 ? results.map((tag: Tag, index: number) => {
                     return TagsItem(props, tag, index, false);
                  }) : search.trim().length > 0 && user !== undefined && tagsByTitle[search] === undefined && NewTagForm(props, search, user.id)
               }
            </ul>
         </div>
      </div>
   );
}