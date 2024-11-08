import clsx from "clsx";
import Button from "@/components/global/button";
import Input from "@/components/global/input";
import {
   faGear,
   faXmark,
   faCloudArrowUp,
   faTag,
   faArrowRotateLeft,
   faGears,
   faTags
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addWorkoutTag, Tag, updateWorkoutTag } from "@/lib/workouts/tags";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { useCallback, useContext, useMemo, useReducer, useRef } from "react";
import {
   formReducer,
   handleResponse,
   VitalityChildProps,
   VitalityProps,
   VitalityResponse,
   VitalityState
} from "@/lib/global/state";
import { Modal } from "@/components/global/modal";
import { searchForTitle } from "@/lib/workouts/shared";
import Loading from "@/components/global/loading";
import Conformation from "@/components/global/confirmation";

const form: VitalityState = {
   tagTitle: {
      value: "",
      error: null,
      data: {}
   },
   tagColor: {
      value: null,
      error: null,
      data: {},
      handlesOnChange: true
   },
   tagSearch: {
      value: "",
      error: null,
      data: {}
   }
};

// Default tag colors, which may be extended in future for any RGB combination
const colors = {
   "Light gray": "rgb(55, 55, 55)",
   Gray: "rgb(90, 90, 90)",
   Brown: "rgb(96, 59, 44)",
   Orange: "rgb(133, 76, 29)",
   Yellow: "rgb(131, 94, 51)",
   Green: "rgb(43, 89, 63)",
   Blue: "rgb(40, 69, 108)",
   Purple: "rgb(73, 47, 100)",
   Pink: "rgb(105, 49, 76)",
   Red: "rgb(110, 54, 48)"
};

interface CreateWorkoutTagProps extends VitalityChildProps {
  onSubmit: () => void;
}

function CreateWorkoutTag(props: CreateWorkoutTagProps) {
   const { localState, onSubmit } = props;
   const search: string = localState.tagSearch.value;

   return (
      <div
         tabIndex = {0}
         className = {clsx(
            "cursor-pointer text-sm font-bold focus:scale-[1.05] hover:scale-[1.05] transition duration-300 ease-in-out rounded-full mb-2 mt-4 focus:outline-blue-500",
         )}
         onClick = {() => {
            onSubmit();
         }}
         onKeyDown = {(event: React.KeyboardEvent) => {
            if (event.key === "Enter") {
               onSubmit();
            }
         }}>
         <div
            className = "relative flex justify-center items-center gap-2 px-4 py-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-full text-white"
            style = {{ backgroundColor: "rgb(90, 90, 90)" }}>
            <FontAwesomeIcon icon = {faTags} />
            {search}
         </div>
      </div>
   );
}

function TagColorPicker(props: VitalityChildProps) {
   const { localState, localDispatch } = props;

   const colorNames = useMemo(() => Object.keys(colors), []);

   const handleChangeColor = useCallback(
      (color: string) => {
      // Update editing color value for the current tag
         localDispatch({
            type: "updateState",
            value: {
               id: "tagColor",
               input: {
                  ...localState.tagColor,
                  value: color,
                  error: null
               }
            }
         });
      },
      [localDispatch, localState],
   );

   return (
      <>
         {colorNames.map((name: string) => {
            const color = colors[name];

            return (
               <div
                  style = {{ backgroundColor: color }}
                  className = {clsx(
                     "flex justify-center items-center text-sm cursor-pointer w-full h-[2.6rem] border-[2px] rounded-sm p-3 text-white text-center",
                     {
                        "border-primary shadow-2xl":
                  localState.tagColor.value === color,
                        "border-white": localState.tagColor.value !== color
                     },
                  )}
                  onClick = {(event) => {
                     event.stopPropagation();
                     handleChangeColor(color);
                  }}
                  key = {name}>
                  {name}
               </div>
            );
         })}
      </>
   );
}

interface EditWorkoutTagProps extends WorkoutTagProps {
  onSave: () => void;
}

function EditWorkoutTag(props: EditWorkoutTagProps): JSX.Element {
   const {
      tag,
      globalState,
      globalDispatch,
      localState,
      localDispatch,
      onSave
   } = props;
   const { updateNotification } = useContext(NotificationContext);

   const handleEditWorkoutTagSubmission = useCallback(
      async(method: "update" | "delete") => {
         const payload: Tag = {
            user_id: tag.user_id,
            id: tag.id,
            title: localState.tagTitle.value.trim(),
            color: localState.tagColor.value.trim()
         };

         const response: VitalityResponse<Tag> = await updateWorkoutTag(
            payload,
            method,
         );

         const successMethod = () => {
            // Display simple success message and update tag options (update or delete)
            const { options, selected } = globalState.tags.data;
            const returnedTag = response.body.data;

            const mapOrFilter =
          method === "update"
             ? (tag: Tag) =>
                tag && tag.id === returnedTag.id ? returnedTag : tag
             : (tag: Tag) => tag !== undefined && tag.id !== returnedTag.id;

            // Based on the provided method, construct a new tag options, selected, and dictionary structures
            const newOptions: Tag[] =
          method === "update"
             ? [...options.map(mapOrFilter)]
             : [...options.filter(mapOrFilter)];
            const newSelected: Tag[] =
          method === "update"
             ? [...selected.map(mapOrFilter)]
             : [...selected.filter(mapOrFilter)];
            // From new options, construct an updated dictionary for valid existing workout tags
            const newDictionary: { [key: string]: Tag } = Object.fromEntries(
               newOptions.map((tag) => [tag.id, tag]),
            );

            if (method === "update") {
               newDictionary[returnedTag.id] = returnedTag;
            } else {
               delete newDictionary[returnedTag.id];
            }

            globalDispatch({
               type: "updateState",
               value: {
                  id: "tags",
                  input: {
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

            // Close the modal form element and scroll into editing tag element
            onSave();
         };

         if (response.status !== "Error") {
            // Handle success or failure responses
            handleResponse(
               localDispatch,
               response,
               successMethod,
               updateNotification,
            );
         } else {
            // Handle error response uniquely by mapping response identifiers to local state identifiers
            localDispatch({
               type: "updateStates",
               value: {
                  tagTitle: {
                     ...localState.tagTitle,
                     error: response.body.errors["title"]?.[0] ?? null
                  },
                  tagColor: {
                     ...localState.tagColor,
                     error: response.body.errors["color"]?.[0] ?? null
                  }
               }
            });
         }
      },
      [
         globalDispatch,
         globalState,
         localDispatch,
         localState.tagColor,
         localState.tagTitle,
         tag.id,
         tag.user_id,
         updateNotification,
         onSave
      ],
   );

   return (
      <div className = "flex flex-col justify-center align-center text-center gap-3 text-black">
         <div className = "flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon = {faGear}
               className = "text-4xl text-primary mt-6"
            />
            <h1 className = "text-2xl font-bold text-black mb-2 px-2">
          Edit Workout Tag
            </h1>
         </div>
         <Input
            id = "tagTitle"
            type = "text"
            label = "Title"
            icon = {faTag}
            input = {localState.tagTitle}
            dispatch = {localDispatch}
            autoFocus
            required
         />
         <div className = "flex flex-col justify-center items-center gap-1">
            <TagColorPicker {...props} />
            {localState.tagColor.error !== null && (
               <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                  <p className = "text-red-500 font-bold input-error">
                     {" "}
                     {localState.tagColor.error}{" "}
                  </p>
               </div>
            )}
         </div>
         <div className = "flex flex-col gap-2">
            <Conformation
               message = "Delete this tag?"
               onConformation = {() => handleEditWorkoutTagSubmission("delete")}
            />
            <Button
               type = "submit"
               className = "bg-primary text-white w-full  h-[2.4rem]"
               icon = {faCloudArrowUp}
               onClick = {() => handleEditWorkoutTagSubmission("update")}>
          Save
            </Button>
         </div>
      </div>
   );
}

export interface WorkoutTagProps extends VitalityChildProps {
  tag: Tag;
  selected: boolean;
}

export function WorkoutTag(props: WorkoutTagProps): JSX.Element {
   const {
      tag,
      selected,
      globalState,
      globalDispatch,
      localState,
      localDispatch
   } = props;
   const editTagModalRef = useRef<{ open: () => void; close: () => void }>(null);
   const tagRef = useRef<HTMLLIElement>(null);

   // Handle adding or removing a selected tag
   const handleSelectWorkoutTag = useCallback(
      (adding: boolean) => {
         globalDispatch({
            type: "updateState",
            value: {
               id: "tags",
               input: {
                  ...globalState.tags,
                  data: {
                     ...globalState.tags.data,
                     // Add to selected options, if applicable, or remove
                     selected: adding
                        ? [...globalState.tags.data.selected, tag]
                        : [...globalState.tags.data.selected].filter(
                           (other: Tag) => other !== tag,
                        )
                  }
               }
            }
         });
      },
      [globalDispatch, globalState.tags, tag],
   );

   const handleInitializeTagForm = useCallback(() => {
      // Update edit tag information globalState
      localDispatch({
         type: "updateStates",
         value: {
            tagTitle: {
               ...localState.tagTitle,
               value: tag.title,
               error: null
            },
            tagColor: {
               ...localState.tagColor,
               value: tag.color,
               error: null
            }
         }
      });
   }, [localDispatch, localState, tag.color, tag.title]);

   const handleEditTagSave = useCallback(() => {
      editTagModalRef.current?.close();
      tagRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
   }, []);

   return (
      <li
         className = {clsx(
            "relative px-4 py-2 m-2 rounded-full text-sm font-bold text-white",
         )}
         style = {{
            backgroundColor: tag.color
         }}
         ref = {tagRef}
         key = {tag.id}>
         <div
            className = "max-w-full mx-auto flex flex-row justify-center items-center"
            onClick = {(event) => {
               event.stopPropagation();

               if (!selected) {
                  handleSelectWorkoutTag(true);
               }
            }}>
            <div className = "cursor-pointer max-w-full pr-3 mx-auto line-clamp-1 break-all text-center text-ellipsis">
               {tag.title}
            </div>
            <div className = "flex flex-row justify-center items-center gap-2 pr-2">
               {
                  <Modal
                     ref = {editTagModalRef}
                     display = {
                        <FontAwesomeIcon
                           icon = {faGears}
                           onClick = {handleInitializeTagForm}
                           className = "cursor-pointer text-md pt-1"
                        />
                     }
                     className = "max-w-[90%] sm:max-w-xl max-h-[90%] mt-12">
                     <EditWorkoutTag
                        {...props}
                        onSave = {handleEditTagSave}
                     />
                  </Modal>
               }
               {selected && (
                  <FontAwesomeIcon
                     onMouseDown = {() => handleSelectWorkoutTag(false)}
                     icon = {faXmark}
                     className = "cursor-pointer text-lg"
                  />
               )}
            </div>
         </div>
      </li>
   );
}

interface TagSelectionProps extends VitalityProps {
  onReset?: () => void;
}

export function TagSelection(props: TagSelectionProps): JSX.Element {
   const { globalState, globalDispatch, onReset } = props;

   // Fetch user and notification information from context
   const { user } = useContext(AuthenticationContext);

   const { updateNotification } = useContext(NotificationContext);

   // Store overall and selected tags
   const { options, selected } = globalState.tags.data;

   // Local state for tag-related inputs
   const [localState, localDispatch] = useReducer(formReducer, form);

   // Convert search string to lower case for case-insensitive comparison
   const search: string = useMemo(() => {
      return localState.tagSearch.value.trim().toLowerCase();
   }, [localState.tagSearch]);

   // Differentiate between selected and unselected options
   const selectedOptions: Set<Tag> = useMemo(() => {
      return new Set<Tag>(selected);
   }, [selected]);

   const searchOptions = useMemo(() => {
      return options.filter((tag: Tag) => !selectedOptions.has(tag));
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

   const handleNewTagSubmission = useCallback(async() => {
      // Default tags have gray color option
      const tag: Tag = {
         user_id: user?.id,
         id: "",
         title: localState.tagSearch.value.trim(),
         color: "rgb(90, 90, 90)"
      };

      const response: VitalityResponse<Tag> = await addWorkoutTag(tag);

      const successMethod = () => {
      // Add the new tag to the overall user tag options
         const newOption: Tag = response.body.data;

         const newOptions: Tag[] = [...globalState.tags.data.options, newOption];
         const newSelected: Tag[] = [...globalState.tags.data.selected, newOption];

         // Dictionary of tags are essential to ignore deleted tags applied to existing workouts
         const newDictionary: { [key: string]: Tag } = Object.fromEntries(
            newOptions.map((tag) => [tag.id, tag]),
         );

         globalDispatch({
            type: "updateState",
            value: {
               id: "tags",
               input: {
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
      };

      if (response.status !== "Error") {
      // Handle success or failure responses
         handleResponse(
            localDispatch,
            response,
            successMethod,
            updateNotification,
         );
      } else {
      // Handle error response uniquely by mapping response identifiers to local state identifiers
         localDispatch({
            type: "updateStates",
            value: {
               tagSearch: {
                  ...localState.tagSearch,
                  error: response.body.errors["search"]?.[0] ?? null
               }
            }
         });
      }
   }, [
      globalDispatch,
      localDispatch,
      localState.tagSearch,
      globalState.tags,
      user?.id,
      updateNotification
   ]);

   const fetched: boolean = globalState.tags.data.fetched;

   return (
      <div>
         {fetched ? (
            <div className = "w-full mx-auto flex flex-col flex-wrap justify-center items-center">
               {globalState.tags.data.selected?.length > 0 && (
                  <ul className = "flex flex-col sm:flex-row flex-wrap justify-center items-center pb-2">
                     {globalState.tags.data.selected.map((selected: Tag) => {
                        return (
                           selected !== undefined && (
                              <WorkoutTag
                                 {...props}
                                 localState = {localState}
                                 localDispatch = {localDispatch}
                                 tag = {selected}
                                 selected = {true}
                                 key = {selected.id}
                              />
                           )
                        );
                     })}
                  </ul>
               )}
               <div className = "relative w-full mx-auto">
                  {onReset && (
                     <FontAwesomeIcon
                        icon = {faArrowRotateLeft}
                        onClick = {onReset}
                        className = "absolute top-[-25px] right-[10px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
                     />
                  )}
                  <Input
                     id = "tagSearch"
                     type = "text"
                     input = {localState.tagSearch}
                     label = "Tags"
                     icon = {faTag}
                     dispatch = {localDispatch}
                     onSubmit = {() => {
                        if (!tagsByTitle[search]) {
                           handleNewTagSubmission();
                        }
                     }}
                  />
               </div>
               {results.length > 0 && (
                  <ul className = "flex flex-row flex-wrap justify-center items-center pt-2">
                     {results.map((tag: Tag) => {
                        return (
                           <WorkoutTag
                              {...props}
                              localState = {localState}
                              localDispatch = {localDispatch}
                              globalState = {globalState}
                              globalDispatch = {globalDispatch}
                              tag = {tag}
                              selected = {false}
                              key = {tag.id}
                           />
                        );
                     })}
                  </ul>
               )}
               {search.trim().length > 0 &&
            user !== undefined &&
            tagsByTitle[search] === undefined && (
                  <CreateWorkoutTag
                     {...props}
                     localState = {localState}
                     localDispatch = {localDispatch}
                     onSubmit = {() => handleNewTagSubmission()}
                  />
               )}
            </div>
         ) : (
            <div className = "w-full h-full justify-center items-center py-12">
               <Loading />
            </div>
         )}
      </div>
   );
}
