import clsx from "clsx";
import Button from "@/components/global/button";
import Input, { VitalityInputProps } from "@/components/global/input";
import { faGear, faXmark, faCloudArrowUp, faTrash, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addWorkoutTag, Tag, updateWorkoutTag } from "@/lib/workouts/tags";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { Dispatch, useCallback, useContext, useMemo } from "react";
import { VitalityAction, VitalityProps, VitalityResponse, VitalityState } from "@/lib/global/state";
import { PopUp } from "@/components/global/popup";
import { searchForTitle } from "@/lib/workouts/shared";

// Default tag colors, which may be extended in future for any RGB combination
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
   const { input, search, userId, globalDispatch } = props;

   const handleNewWorkoutTagSubmission = useCallback(async() => {
      // Default tags have gray color option
      const tag: Tag = {
         user_id: userId,
         id: "",
         title: search,
         color: "rgb(90, 90, 90)"
      };

      const response = await addWorkoutTag(tag);

      if (!(response.status === "Success")) {
         // Display the respective error message
         globalDispatch({
            type: "updateErrors",
            value: response
         });
      } else {
         // Add the new tag (search pattern) to the overall user options
         const newOption: Tag = response.body.data;

         const newOptions: Tag[] = [...input.data.options, newOption];
         const newSelected: Tag[] = [...input.data.selected, newOption];

         // Dictionary of tags are essential to ignore deleted tags applied to existing workouts
         const newDictionary: { [key: string]: Tag } = Object.fromEntries(newOptions.map(tag => [tag.id, tag]));
         newDictionary[newOption.id] = newOption;

         globalDispatch({
            type: "updateglobalState",
            value: {
               ...input,
               data: {
                  ...input.data,
                  options: newOptions,
                  selected: newSelected,

                  dictionary: newDictionary
               }
            }
         });
      }
   }, [globalDispatch, input, search, userId]);

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
         }}
      >
         <h1>Create <span className = "inline-block px-3 py-1 rounded-full text-sm font-bold text-white" style = {{ backgroundColor: "rgb(90, 90, 90)" }}>{search}</span></h1>
      </div>
   );
}

interface TagColorPickerProps {
   globalState: VitalityState;
   globalDispatch: globalDispatch<VitalityAction<Tag>>;
}

function TagColorPicker(props: TagColorPickerProps) {
   const { globalState, globalDispatch } = props;

   const colorNames = useMemo(() => Object.keys(colors), []);

   const handleChangeColor = useCallback((color: string) => {
      // Update editing color value for the current tag
      globalDispatch({
         type: "updateglobalStates",
         value: {
            ...globalState,
            tagsColor: {
               ...globalState.tagsColor,
               value: color,
               error: null
            }
         }
      });
   }, [globalDispatch, globalState]);

   return (
      <>
         {colorNames.map((name: string) => {
            const color = colors[name];

            return (
               <div
                  style = {{ backgroundColor: color }}
                  className = {clsx("cursor-pointer w-full h-[3rem] border-[3px] rounded-sm p-3 text-white text-center", {
                     "border-primary scale-[1.02] shadow-2xl": globalState.tagsColor.value === color,
                     "border-white": globalState.tagsColor.value !== color
                  })}
                  onClick = {() => handleChangeColor(color)}
                  key = {name}
               >
                  {name}
               </div>
            );
         })}
      </>
   );
};

function EditWorkoutTag(props: WorkoutTagProps): JSX.Element {
   const { tag, globalState, globalDispatch } = props;
   const { updateNotification } = useContext(NotificationContext);

   const handleEditWorkoutTagSubmission = useCallback(async(method: "update" | "delete") => {
      const payload: Tag = {
         user_id: tag.user_id,
         id: tag.id,
         title: globalState.tagsTitle.value.trim(),
         color: globalState.tagsColor.value.trim()
      };

      const response: VitalityResponse<Tag> = await updateWorkoutTag(payload, method);

      if (response.status !== "Success") {
         // Add respective errors, if any
         globalDispatch({
            type: "updateglobalStates",
            value: {
               ...globalState,

               tagsTitle: {
                  ...globalState.tagsTitle,
                  error: response.body.errors["title"] ?? null
               },
               tagsColor: {
                  ...globalState.tagsColor,
                  error: response.body.errors["color"] ?? null
               }


            }
         });
      } else {
         // Display simple success message and update tag options (update or delete)
         const { options, selected } = globalState.tags.data;
         const returnedTag = response.body.data;

         const mapOrFilter = method === "update" ?
            (tag: Tag) => (tag && tag.id === returnedTag.id ? returnedTag : tag) :
            (tag: Tag) => (tag !== undefined && tag.id !== returnedTag.id);

         // Based on the provided method, construct a new tag options, selected, and dictionary structures
         const newOptions: Tag[] = method === "update" ? [...options.map(mapOrFilter)] : [...options.filter(mapOrFilter)];
         const newSelected: Tag[] = method === "update" ? [...selected.map(mapOrFilter)] : [...selected.filter(mapOrFilter)];
         // From new options, construct an updated dictionary for valid existing workout tags
         const newDictionary: { [key: string]: Tag } = Object.fromEntries(newOptions.map(tag => [tag.id, tag]));

         if (method === "update") {
            newDictionary[returnedTag.id] = returnedTag;
         } else {
            delete newDictionary[returnedTag.id];
         }

         globalDispatch({
            type: "updateglobalStates",
            value: {
               ...globalState,
               tags: {
                  ...globalState.tags,
                  data: {
                     ...globalState.tags.data,
                     options: newOptions,
                     selected: newSelected,
                     dictionary: newDictionary
                  }
               }
            }
         });
      }

      if (response.status !== "Error") {
         // Display the success or failure notification to the user
         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1250
         });
      }
   }, [globalDispatch, globalState, tag.id, tag.user_id, updateNotification]);

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
         <Input input = {globalState.tagsTitle} label = "Title" icon = {faTag} globalDispatch = {globalDispatch} />
         <div className = "flex flex-col justify-center items-center gap-2">
            <TagColorPicker globalState = {globalState} globalDispatch = {globalDispatch} />
            {/* Potential error message for invalid color passed to tag form submission from frontend */}
            {globalState.tagsColor.error !== null &&
               <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                  <p className = "text-red-500 font-bold input-error"> {globalState.tagsColor.error} </p>
               </div>
            }
         </div>
         <div>
            <Button
               type = "submit" className = "bg-red-500 text-white w-full h-[2.9rem]" icon = {faTrash}
               onClick = {() => handleEditWorkoutTagSubmission("delete")}
            >
               Delete
            </Button>
         </div>
         <div>
            <Button
               type = "submit" className = "bg-primary text-white w-full  h-[2.9rem]" icon = {faCloudArrowUp}
               onClick = {() => handleEditWorkoutTagSubmission("update")}
            >
               Save
            </Button>
         </div>
      </div>
   );
}

export interface WorkoutTagProps extends VitalityInputProps {
   globalState: VitalityState;
   tag: Tag;
   selected: boolean;
}

export function WorkoutTag(props: WorkoutTagProps): JSX.Element {
   const { input, tag, selected, globalState, globalDispatch } = props;

   // Handle adding or removing a selected tag
   const handleSelectWorkoutTag = useCallback((adding: boolean) => {
      globalDispatch({
         type: "updateglobalState",
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
   }, [globalDispatch, input, tag]);

   const handleInitializeTagForm = useCallback(() => {
      // Update edit tag information globalState
      globalDispatch({
         type: "updateglobalStates",
         value: {
            ...globalState,
            tagsTitle: {
               ...globalState.tagsTitle,
               value: tag.title,
               error: null
            },
            tagsColor: {
               ...globalState.tagsColor,
               value: tag.color,
               error: null
            }
         }
      });
   }, [globalDispatch, globalState, tag.color, tag.title]);

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
                        onClick = {handleInitializeTagForm}
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

export function TagSelection(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;

   // Fetch user information from context
   const { user } = useContext(AuthenticationContext);

   // Store overall and selected tags
   const { options, selected } = globalState.tags.data;

   // Convert search string to lower case for case-insensitive comparison
   const search: string = useMemo(() => {
      return globalState.search.value.trim().toLowerCase();
   }, [globalState.search]);

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

   // Tags by title to show that current search pattern exists or can be used as a new tag title
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
            <ul className = {clsx("flex flex-row flex-wrap justify-center items-center", {
               "pb-3": globalState.tags.data.selected.length > 0
            })}>
               {
                  globalState.tags.data.selected.map((selected: Tag) => {
                     return (
                        selected !== undefined &&
                        <WorkoutTag input = {globalState.tags} label = "Tags" globalState = {globalState} dispatch = {globalDispatch} tag = {selected} selected = {true} key = {selected.id} />
                     );
                  })
               }
            </ul>
            <div className = "w-full mx-auto">
               <Input
                  id = "search"
                  input = {globalState.search}
                  label = "Tags"
                  icon = {faTag}
                  dispatch = {globalDispatch}
               />
            </div>
            <ul className = {clsx("flex flex-row flex-wrap justify-center items-center", {
               "pt-3": results.length > 0 || search.trim().length > 0
            })}>
               {
                  results.length > 0 ? results.map((tag: Tag) => {
                     return <WorkoutTag {...props} globalState = {globalState} globalDispatch = {globalDispatch} tag = {tag} selected = {false} key = {tag.id} />;
                  }) : search.trim().length > 0 && user !== undefined && tagsByTitle[search] === undefined && (
                     <CreateWorkoutTag {...props} search = {search} userId = {user.id} />
                  )
               }
            </ul>
         </div>
      </div>
   );
}