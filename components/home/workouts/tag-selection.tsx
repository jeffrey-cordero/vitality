import clsx from "clsx";
import Input, { VitalityInputProps } from "@/components/global/input";
import Button from "@/components/global/button";
import { faGear, faXmark, faCloudArrowUp, faTrash, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addWorkoutTag, Tag, updateWorkoutTag } from "@/lib/workouts/tags";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { useContext, useMemo } from "react";
import { VitalityResponse, VitalityState } from "@/lib/global/state";
import { PopUp } from "@/components/global/popup";
import { searchForTitle } from "@/lib/workouts/shared";

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

interface CreateWorkoutTagProps extends VitalityInputProps {
   search: string;
   userId: string;
}

function CreateWorkoutTag(props: CreateWorkoutTagProps) {
   const { input, search, userId, dispatch } = props;

   const handleNewWorkoutTagSubmission = async() => {
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
         const newOption: Tag = response.body.data;

         const newOptions: Tag[] = [...input.data.options, newOption];
         const newSelected: Tag[] =  [...input.data.selected, newOption];
         const newDictionary: { [key: string]: Tag } = Object.fromEntries(newOptions.map(tag => [tag.id, tag]));
         newDictionary[newOption.id] = newOption;

         dispatch({
            type: "updateInput",
            value: {
               ...input,
               data: {
                  ...input.data,
                  // Resulting data from backend is the tag with the unique ID in UUID format
                  options: newOptions,
                  selected: newSelected,
                  dictionary: newDictionary
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
            handleNewWorkoutTagSubmission();
         }}
         onKeyDown = {(event) => {
            if (event.key === "Enter") {
               handleNewWorkoutTagSubmission();
            }
         }
         }
      >
         <h1>Create <span className = "inline-block px-3 py-1 rounded-full text-sm font-bold text-white" style = {{ backgroundColor: "rgb(90, 90, 90)" }}>{search}</span></h1>
      </div>
   );
}

function EditWorkoutTag(props: WorkoutTagProps): JSX.Element {
   const { tag, state, dispatch } = props;
   const { updateNotification } = useContext(NotificationContext);

   const handleEditWorkoutTagSubmission = async(method: "update" | "delete") => {
      const payload: Tag = {
         user_id: tag.user_id,
         id: tag.id,
         title: state.inputs.tagsTitle.value.trim(),
         color: state.inputs.tagsColor.value.trim()
      };

      const response: VitalityResponse<Tag> = await updateWorkoutTag(payload, method);

      if (response.status !== "Success") {
         // Add respective errors, if any
         dispatch({
            type: "updateState",
            value: {
               ...state,
               inputs: {
                  ...state.inputs,
                  tagsTitle: {
                     ...state.inputs.tagsTitle,
                     error: response.body.errors["title"] ?? null
                  },
                  tagsColor: {
                     ...state.inputs.tagsColor,
                     error: response.body.errors["color"] ?? null
                  }
               }

            }
         });
      } else {
         // Display simple success message and update tag options (update or delete)
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
         <Input input = {state.inputs.tagsTitle} label = "Title" icon = {faTag} dispatch = {dispatch} />
         <div className = "flex flex-col justify-center items-center gap-2">
            {
               Object.keys(colors).map((name: string) => {
                  const color: string = colors[name];

                  const changeColor = () => {
                     // Update editing color value
                     dispatch({
                        type: "updateState",
                        value: {
                           ...state,
                           inputs: {
                              ...state.inputs,
                              tagsColor: {
                                 ...state.inputs.tagsColor,
                                 value: color,
                                 error: null
                              }
                           }
                        }
                     });
                  };

                  return (
                     <div
                        style = {{ backgroundColor: color }}
                        className = {clsx("cursor-pointer w-full h-[3rem] border-[3px] rounded-sm p-3 text-white text-center", {
                           "border-primary scale-[1.02]": state.inputs.tagsColor.value === color,
                           "border-white": state.inputs.tagsColor.value !== color
                        })}
                        onClick = {changeColor}
                        key = {color}>
                        {name}
                     </div>
                  );
               })
            }
            {/* Potential error message for invalid color in payload */}
            {state.inputs.tagsColor.error !== null &&
               <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                  <p className = "text-red-500 font-bold input-error"> {state.inputs.tagsColor.error[0]} </p>
               </div>
            }
         </div>
         <div>
            <Button
               type = "submit" className = "bg-red-500 text-white w-full" icon = {faTrash}
               onClick = {() => handleEditWorkoutTagSubmission("delete")}
            >
               Delete
            </Button>
         </div>
         <div>
            <Button
               type = "submit" className = "bg-primary text-white w-full" icon = {faCloudArrowUp}
               onClick = {() => handleEditWorkoutTagSubmission("update")}
            >
               Save
            </Button>
         </div>
      </div>
   );
}

export interface WorkoutTagProps extends VitalityInputProps {
   state: VitalityState;
   tag: Tag;
   selected: boolean;
}

export function WorkoutTag(props: WorkoutTagProps): JSX.Element {
   const { input, tag, selected, state, dispatch } = props;

   // Handle adding or removing a selected tag
   const handleSelectWorkoutTag = (adding: boolean) => {
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
                  handleSelectWorkoutTag(true);
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
                              type: "updateState",
                              value: {
                                 ...state,
                                 inputs: {
                                    ...state.inputs,
                                    tagsTitle: {
                                       ...state.inputs.tagsTitle,
                                       value: tag.title,
                                       error: null
                                    },
                                    tagsColor: {
                                       ...state.inputs.tagsColor,
                                       value: tag.color,
                                       error: null
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
                  onMouseDown = {() => handleSelectWorkoutTag(false)}
                  icon = {faXmark}
                  className = "cursor-pointer text-md transition duration-300 ease-in-out hover:scale-125 hover:text-red-500"
               />
            }
         </div>
      </li>
   );
};


export interface TagSelectionProps extends VitalityInputProps {
   state: VitalityState;
}

export function TagSelection(props: TagSelectionProps): JSX.Element {
   const { input, state, dispatch } = props;

   // Fetch user information from context
   const { user } = useContext(AuthenticationContext);

   // Store overall and selected tags
   const { options, selected } = input.data;

   // Convert search string to lower case for case-insensitive comparison
   const search: string = useMemo(() => {
      return state.inputs.tagsSearch.value.trim().toLowerCase();
   }, [state.inputs.tagsSearch]);

   // Differentiate between selected and unselected options
   const selectedOptions: Set<Tag> = useMemo(() => {
      return new Set<Tag>(selected);
   }, [selected]);

   const searchOptions = useMemo(() => {
      return options.filter((tag: Tag) => !(selectedOptions.has(tag)));
   }, [options, selectedOptions]);

   // Search results
   const results: Tag[] = useMemo(() => {
      return searchForTitle(searchOptions, search);
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
            <ul className = "flex flex-row flex-wrap justify-center items-center">
               {
                  state.inputs.tags.data.selected.map((selected: Tag) => {
                     return (
                        selected !== undefined &&
                        <WorkoutTag input = {state.inputs.tags} label = "Tags" state = {state} dispatch = {dispatch} tag = {selected} selected = {true} key = {selected.id} />
                     );
                  })
               }
            </ul>
            <div className = "w-full mx-auto">
               <Input
                  input = {state.inputs.tagsSearch}
                  label = "Tags"
                  icon = {faTag}
                  dispatch = {dispatch}
               />
            </div>
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