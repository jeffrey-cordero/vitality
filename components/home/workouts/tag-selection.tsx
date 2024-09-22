import clsx from "clsx";
import Input, { VitalityInputProps } from "@/components/global/input";
import Button from "@/components/global/button";
import { faGear, faXmark, faCloudArrowUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addWorkoutTag, Tag, updateWorkoutTag } from "@/lib/workouts/workouts";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { useContext, useMemo } from "react";
import { VitalityResponse } from "@/lib/global/state";
import { PopUp } from "@/components/global/popup";

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

function searchForTag(tags: Tag[], search: string): Tag[] {
   // Handle no input for tag search
   if (search === "") {
      return tags;
   }

   // Simple search for tag based on starting with specific pattern
   return tags.filter(tag => tag.title.toLowerCase().startsWith(search));
}

interface CreateWorkoutTagProps extends VitalityInputProps {
   search: string;
   userId: string;
}

function CreateWorkoutTag(props: CreateWorkoutTagProps) {
   const { input, search, userId, dispatch } = props;

   const handleSubmission = async() => {
      const tag: Tag = {
         user_id: userId,
         id: "",
         title: search,
         color: "rgb(90, 90, 90)"
      };

      const response = await addWorkoutTag(tag);

      if (!(response.status === "Success")) {
         // Display the respective error message
         dispatch({
            type: "updateStatus",
            value: response
         });
      } else {
         // Add the new tag (search pattern) to the overall user options
         dispatch({
            type: "updateInput",
            value: {
               ...input,
               data: {
                  ...input.data,
                  // Resulting data from backend is the tag with the unique ID in UUID format
                  options: [...input.data.options, response.body.data],
                  selected: [...input.data.selected, response.body.data]
               }
            }
         });
      }
   };

   return (
      <div
         tabIndex = {0}
         className = "cursor-pointer transition duration-300 ease-in-out hover:bg-gray-100 p-3 rounded-2xl"
         onClick = {() => {
            handleSubmission();
         }}
         onKeyDown = {(event) => {
            if (event.key === "Enter") {
               handleSubmission();
            }
         }
         }
      >
         <h1>Create <span className = "inline-block px-3 py-1 rounded-full text-sm font-bold text-white" style = {{ backgroundColor: "rgb(90, 90, 90)" }}>{search}</span></h1>
      </div>
   );
}

function EditWorkoutTag(props: WorkoutTagProps): JSX.Element {
   const { input, tag, state, dispatch } = props;
   const { updateNotification } = useContext(NotificationContext);

   const handleSubmission = async(method: "update" | "delete") => {
      const payload: Tag = {
         user_id: tag.user_id,
         id: tag.id,
         title: input.data.inputs.editTitle.value.trim(),
         color: input.data.inputs.editColor.value.trim()
      };

      const response: VitalityResponse<Tag> = await updateWorkoutTag(payload, method);

      if (response.status !== "Success") {
         // Add respective errors, if any
         dispatch({
            type: "updateInput",
            value: {
               ...input,
               data: {
                  ...input.data,
                  inputs: {
                     editTitle: {
                        ...input.data.inputs.editTitle,
                        error: response.body.errors["title"] ?? null
                     },
                     editColor: {
                        ...input.data.inputs.editColor,
                        error: response.body.errors["color"] ?? null
                     }
                  }
               }
            }
         });
      } else {
         // Display simple success message and update tag options (update or delete)
         if (state !== undefined) {
            const { options, selected } = state.inputs.tags.data;
            const returnedTag = response.body.data;

            const mapOrFilter = method === "update" ?
               (tag: Tag) => (tag && tag.id === returnedTag.id ? returnedTag : tag) :
               (tag: Tag) => (tag !== undefined && tag.id !== returnedTag.id);

            const newOptions: Tag[] = method === "update" ? [...options.map(mapOrFilter)] : [...options.filter(mapOrFilter)];
            const newSelected: Tag[] = method === "update" ? [...selected.map(mapOrFilter)] : [...selected.filter(mapOrFilter)];
            const newDictionary: { [key: string]: Tag } = Object.fromEntries(newOptions.map(tag => [tag.id, tag]));

            if (method === "update") {
               newDictionary[returnedTag.id] = returnedTag;
            } else {
               delete newDictionary[returnedTag.id];
            }

            dispatch({
               type: "updateState",
               value: {
                  status: "Success",
                  inputs: {
                     ...state.inputs,
                     tags: {
                        ...state.inputs.tags,
                        data: {
                           ...state.inputs.tags.data,
                           options: newOptions,
                           selected: newSelected,
                           dictionary: newDictionary
                        }
                     }
                  },
                  response: response
               }
            });
         }
      }

      if (response.status !== "Error") {
         // Display the success or failure notification to the user
         updateNotification({
            status: response.status,
            message: response.body.message
         });
      }
   };

   return (
      <div className = "flex flex-col justify-center align-center text-center gap-3 text-black">
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
            input = {input.data.inputs.editTitle} label = "&#x1F58A; Title" dispatch = {dispatch}
            onChange = {(event: React.ChangeEvent<HTMLInputElement>) => {
               // Update editing title value
               dispatch({
                  type: "updateInput",
                  value: {
                     ...input,
                     data: {
                        ...input.data,
                        inputs: {
                           ...input.data.inputs,
                           editTitle: {
                              ...input.data.inputs.editTitle,
                              value: event.target.value,
                              error: null
                           }
                        }
                     }
                  }
               });
            }}
         />
         <div className = "flex flex-col justify-center items-center gap-2">
            {
               Object.keys(colors).map((name: string) => {
                  const color: string = colors[name];

                  const changeColor = () => {
                     // Update editing color value
                     dispatch({
                        type: "updateInput",
                        value: {
                           ...input,
                           data: {
                              ...input.data,
                              inputs: {
                                 ...input.data.inputs,
                                 editColor: {
                                    ...input.data.inputs.editColor,
                                    value: color
                                 }
                              }
                           }
                        }
                     });
                  };

                  return (
                     <div
                        style = {{ backgroundColor: color }}
                        className = {clsx("cursor-pointer w-full h-[3rem] border-[3px] rounded-sm p-3 text-white text-center", {
                           "border-primary scale-[1.02]": input.data.inputs.editColor.value === color,
                           "border-white": input.data.inputs.editColor.value !== color
                        })}
                        onClick = {changeColor}
                        key = {color}>
                        {name}
                     </div>
                  );
               })
            }
            {/* Potential error message for invalid color in payload */}
            {input.data.inputs.editColor.error !== null &&
               <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                  <p className = "text-red-500 font-bold input-error"> {input.data.inputs.editColor.error[0]} </p>
               </div>
            }
         </div>
         <div>
            <Button
               type = "submit" className = "bg-red-500 text-white w-full" icon = {faTrash}
               onClick = {() => handleSubmission("delete")}
            >
               Delete
            </Button>
         </div>
         <div>
            <Button
               type = "submit" className = "bg-primary text-white w-full" icon = {faCloudArrowUp}
               onClick = {() => handleSubmission("update")}
            >
               Save
            </Button>
         </div>
      </div>
   );
}

export interface WorkoutTagProps extends VitalityInputProps {
   tag: Tag;
   selected: boolean;
}

export function WorkoutTag(props: WorkoutTagProps): JSX.Element {
   const { input, tag, selected, dispatch } = props;

   // Handle adding or removing a selected tag
   const handleOnClick = (adding: boolean) => {
      dispatch({
         type: "updateInput",
         value: {
            ...input,
            data: {
               ...input.data,
               // Add to selected options, if applicable, or remove
               selected: adding ? [...input.data.selected, tag]
                  : [...input.data.selected].filter((other: Tag) => (other) !== tag)
            }
         }
      });
   };

   return (
      <li
         className = {clsx("px-3 py-1 m-2 rounded-full text-sm font-bold text-white transition duration-300 ease-in-out")}
         style = {{
            backgroundColor: tag.color
         }}
         key = {tag.id}
      >
         <div
            className = "flex justify-center items-center gap-3 p-1"
            onClick = {() => {
               if (!(selected)) {
                  handleOnClick(true);
               }
            }}
         >
            <div className = "cursor-pointer">
               {tag.title}
            </div>
            {
               <PopUp
                  className = "max-w-2xl"
                  cover = {
                     <FontAwesomeIcon
                        icon = {faGear}
                        onClick = {() => {
                           // Update edit tag information state
                           dispatch({
                              type: "updateInput",
                              value: {
                                 ...input,
                                 data: {
                                    ...input.data,
                                    inputs: {
                                       editTitle: {
                                          ...input.data.inputs.editTitle,
                                          value: tag.title,
                                          error: null
                                       },
                                       editColor: {
                                          ...input.data.inputs.editColor,
                                          value: tag.color,
                                          error: null
                                       }
                                    }
                                 }
                              }
                           });
                        }}
                        className = "cursor-pointer text-xs hover:scale-125 transition duration-300 ease-in-out"
                     />
                  }
               >
                  <EditWorkoutTag {...props} />
               </PopUp>
            }
            {
               selected &&
               <FontAwesomeIcon
                  onMouseDown = {() => handleOnClick(false)}
                  icon = {faXmark}
                  className = "cursor-pointer text-md transition duration-300 ease-in-out hover:scale-125 hover:text-red-500"
               />
            }
         </div>
      </li>
   );
};

export function TagSelection(props: VitalityInputProps): JSX.Element {
   const { input, state, dispatch } = props;

   // Fetch user information from context
   const { user } = useContext(AuthenticationContext);

   // Store overall and selected tags
   const { options, selected } = input.data;

   // Convert search string to lower case for case-insensitive comparison
   const search: string = useMemo(() => {
      return state?.inputs.tags.data.inputs.tagSearch.value.trim().toLowerCase();
   }, [state?.inputs.tags.data.inputs.tagSearch]);

   // Differentiate between selected and unselected options
   const selectedOptions: Set<Tag> = useMemo(() => {
      return new Set<Tag>(selected);
   }, [selected]);

   const searchOptions = useMemo(() => {
      return options.filter((tag: Tag) => !(selectedOptions.has(tag)));
   }, [options, selectedOptions]);

   // Search results
   const results: Tag[] = useMemo(() => {
      return searchForTag(searchOptions, search);
   }, [searchOptions, search]);

   // Tags by title
   const tagsByTitle: { [title: string]: Tag } = useMemo(() => {
      const titles = {};

      for (const tag of options) {
         titles[tag.title] = tag;
      }

      return titles;
   }, [options]);

   return (
      <div>
         <div className = "flex flex-col flex-wrap justify-center items-center">
            <ul className = "flex flex-col flex-wrap justify-center items-center">
               {
                  results.length > 0 ? results.map((tag: Tag) => {
                     return <WorkoutTag {...props} state = {state} dispatch = {dispatch} tag = {tag} selected = {false} key = {tag.id} />;
                  }) : search.trim().length > 0 && user !== undefined && tagsByTitle[search] === undefined && (
                     <CreateWorkoutTag {...props} search = {search} userId = {user.id} />
                  )
               }
            </ul>
         </div>
      </div>
   );
}