import clsx from "clsx";
import Button from "@/components/global/button";
import Input from "@/components/global/input";
import Loading from "@/components/global/loading";
import Conformation from "@/components/global/confirmation";
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
import { addWorkoutTag, updateWorkoutTag, Tag } from "@/lib/home/workouts/tags";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { useCallback, useContext, useMemo, useReducer, useRef } from "react";
import {
   VitalityChildProps,
   VitalityProps,
   VitalityState,
   formReducer
} from "@/lib/global/state";
import { handleResponse, VitalityResponse } from "@/lib/global/response";
import { Modal } from "@/components/global/modal";

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

// Default tag colors
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

const colorValues = Object.values(colors);
let randomColor: string = colorValues[Math.floor(Math.random() * colorValues.length)];

interface CreateTagContainerProps extends VitalityChildProps {
   onSubmit: () => void;
}

function CreateTagContainer(props: CreateTagContainerProps) {
   const { localState, onSubmit } = props;
   const search: string = localState.tagSearch.value;

   return (
      <div
         tabIndex = {0}
         className = {clsx(
            "cursor-pointer text-sm font-bold focus:scale-[1.05] hover:scale-[1.05] transition duration-300 ease-in-out rounded-full mb-2 mt-4 focus:outline-blue-500",
         )}
         onClick = {onSubmit}
         onKeyDown = {(event: React.KeyboardEvent) => {
            if (event.key === "Enter") {
               onSubmit();
            }
         }}>
         <div
            className = "relative flex justify-center items-center gap-2 px-4 py-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-full text-white"
            style = {{ backgroundColor: randomColor }}>
            <FontAwesomeIcon icon = {faTags} />
            {search}
         </div>
      </div>
   );
}

function TagColorInput(props: VitalityChildProps) {
   const { localState, localDispatch } = props;

   const names = useMemo(() => {
      return Object.keys(colors);
   }, []);

   const handleColorChange = useCallback(
      (color: string) => {
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
      }, [
         localDispatch,
         localState
      ]);

   return (
      <div className = "relative w-full mx-auto">
         {names.map((name: string) => {
            const color = colors[name];

            return (
               <div
                  style = {{ backgroundColor: color }}
                  className = {clsx(
                     "flex justify-center items-center text-sm cursor-pointer w-full h-[2.6rem] border-[2px] rounded-sm p-3 text-white text-center",
                     {
                        "border-primary border-[4px] shadow-2xl":
                           localState.tagColor.value === color,
                        "border-white": localState.tagColor.value !== color
                     },
                  )}
                  onClick = {(event) => {
                     event.stopPropagation();
                     handleColorChange(color);
                  }}
                  key = {name}>
                  {name}
               </div>
            );
         })}
      </div>
   );
}

interface EditTagContainerProps extends TagContainerProps {
   onSave: () => void;
}

function EditTagContainer(props: EditTagContainerProps): JSX.Element {
   const {
      tag,
      globalState,
      globalDispatch,
      localState,
      localDispatch,
      onSave
   } = props;
   const { updateNotification } = useContext(NotificationContext);

   const handleTagUpdates = useCallback(
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
            const { options, selected } = globalState.tags.data;
            const returnedTag: Tag = response.body.data as Tag;

            const mapOrFilter =
               method === "update"
                  ? (tag: Tag) =>
                     tag && tag.id === returnedTag.id ? returnedTag : tag
                  : (tag: Tag) => tag !== undefined && tag.id !== returnedTag.id;

            const newTags: Tag[] =
               method === "update"
                  ? [...options.map(mapOrFilter)]
                  : [...options.filter(mapOrFilter)];
            const newSelected: Tag[] =
               method === "update"
                  ? [...selected.map(mapOrFilter)]
                  : [...selected.filter(mapOrFilter)];

            // Holds valid existing workout tags to account for removals in other tag view containers
            const newDictionary: { [key: string]: Tag } = Object.fromEntries(
               newTags.map((tag) => [tag.id, tag]),
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
                        options: newTags,
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
               Edit Tag
            </h1>
         </div>
         <Input
            id = "tagTitle"
            type = "text"
            label = "Title"
            icon = {faTag}
            input = {localState.tagTitle}
            dispatch = {localDispatch}
            onSubmit = {() => handleTagUpdates("update")}
            autoFocus
            required
         />
         <div className = "flex flex-col justify-center items-center gap-1">
            <TagColorInput {...props} />
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
               onConformation = {() => handleTagUpdates("delete")}
            />
            <Button
               type = "submit"
               className = "bg-primary text-white w-full  h-[2.4rem]"
               icon = {faCloudArrowUp}
               onClick = {() => handleTagUpdates("update")}>
               Save
            </Button>
         </div>
      </div>
   );
}

interface TagContainerProps extends VitalityChildProps {
   tag: Tag;
   selected: boolean;
}

function TagContainer(props: TagContainerProps): JSX.Element {
   const {
      tag,
      selected,
      globalState,
      globalDispatch,
      localState,
      localDispatch
   } = props;
   const tagRef = useRef<HTMLLIElement>(null);
   const editTagModalRef = useRef<{ open: () => void; close: () => void }>(null);

   // Handle adding or removing a selected tag
   const handleTagSelect = useCallback(
      (adding: boolean) => {
         globalDispatch({
            type: "updateState",
            value: {
               id: "tags",
               input: {
                  ...globalState.tags,
                  data: {
                     ...globalState.tags.data,
                     selected: adding
                        ? [...globalState.tags.data.selected, tag]
                        : [...globalState.tags.data.selected].filter(
                           (other: Tag) => other !== tag,
                        )
                  }
               }
            }
         });
      }, [
         globalDispatch,
         globalState.tags,
         tag
      ]);

   const handleTagEdits = useCallback(() => {
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
   }, [
      localDispatch,
      localState,
      tag.color,
      tag.title
   ]);

   const handleTagSave = useCallback(() => {
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
         <div className = "max-w-full mx-auto flex flex-row justify-center items-center">
            <div
               onClick = {(event) => {
                  event.stopPropagation();

                  if (!selected) {
                     handleTagSelect(true);
                  }
               }}
               className = "cursor-pointer max-w-full pr-3 mx-auto line-clamp-1 break-all text-center text-ellipsis">
               {tag.title}
            </div>
            <div className = "flex flex-row justify-center items-center gap-2 pr-2">
               {
                  <Modal
                     ref = {editTagModalRef}
                     display = {
                        <FontAwesomeIcon
                           icon = {faGears}
                           onClick = {handleTagEdits}
                           className = "cursor-pointer text-md pt-1"
                        />
                     }
                     className = "max-w-[90%] sm:max-w-xl max-h-[90%] mt-12">
                     <EditTagContainer
                        {...props}
                        onSave = {handleTagSave}
                     />
                  </Modal>
               }
               {selected && (
                  <FontAwesomeIcon
                     onMouseDown = {() => handleTagSelect(false)}
                     icon = {faXmark}
                     className = "cursor-pointer text-lg"
                  />
               )}
            </div>
         </div>
      </li>
   );
}

interface TagsProps extends VitalityProps {
   onReset?: () => void;
}

export function Tags(props: TagsProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const { globalState, globalDispatch, onReset } = props;

   // Fetch overall and selected tags lists
   const { options, selected } = globalState.tags.data;

   // Local state for tag-related inputs
   const [localState, localDispatch] = useReducer(formReducer, form);

   const fetched: boolean = globalState.tags.data.fetched;

   // Differentiate between selected and unselected options
   const selectedOptions: Set<Tag> = useMemo(() => {
      return new Set<Tag>(selected);
   }, [selected]);

   const searchOptions = useMemo(() => {
      return options.filter((tag: Tag) => !selectedOptions.has(tag));
   }, [
      options,
      selectedOptions
   ]);

   const search: string = useMemo(() => {
      return localState.tagSearch.value.trim();
   }, [localState.tagSearch]);

   // Workout tag results through case-insensitive title comparison
   const searchResults: Tag[] = useMemo(() => {
      const lower = search.toLowerCase();

      return search === "" ?
         searchOptions : searchOptions.filter((t) => t.title.toLowerCase().includes(lower));
   }, [
      searchOptions,
      search
   ]);

   // Tags by title to determine if search pattern exists or may be used for a new tag
   const tagsByTitle: { [title: string]: Tag } = useMemo(() => {
      const titles = {};

      for (const tag of options) {
         titles[tag.title] = tag;
      }

      return titles;
   }, [options]);

   const handleTagCreation = useCallback(async() => {
      // Default tags have gray color option
      const tag: Tag = {
         user_id: user.id,
         id: "",
         title: localState.tagSearch.value.trim(),
         color: randomColor
      };

      const response: VitalityResponse<Tag> = await addWorkoutTag(tag);

      const successMethod = () => {
         // Add the new tag to the overall user tag options
         const newOption: Tag = response.body.data as Tag;

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

         // Fetch a new random color
         randomColor = colorValues[Math.floor(Math.random() * colorValues.length)];
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
                  error: response.body.errors["title"]?.[0] ?? null
               }
            }
         });
      }
   }, [
      globalDispatch,
      localDispatch,
      localState.tagSearch,
      globalState.tags,
      user,
      updateNotification
   ]);

   return (
      <div>
         {fetched ? (
            <div className = "w-full mx-auto flex flex-col flex-wrap justify-center items-center">
               {globalState.tags.data.selected?.length > 0 && (
                  <ul className = "flex flex-col sm:flex-row flex-wrap justify-center items-center pb-2">
                     {globalState.tags.data.selected.map((selected: Tag) => {
                        return (
                           selected !== undefined && (
                              <TagContainer
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
                     <div className = "relative mt-4">
                        <FontAwesomeIcon
                           icon = {faArrowRotateLeft}
                           onClick = {onReset}
                           className = "absolute top-[-25px] right-[10px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
                        />
                     </div>
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
                           handleTagCreation();
                        }
                     }}
                  />
               </div>
               {searchResults.length > 0 && (
                  <ul className = "flex flex-row flex-wrap justify-center items-center pt-2">
                     {searchResults.map((tag: Tag) => {
                        return (
                           <TagContainer
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
               {search.trim().length > 0 && !tagsByTitle[search] && (
                  <CreateTagContainer
                     {...props}
                     localState = {localState}
                     localDispatch = {localDispatch}
                     onSubmit = {() => handleTagCreation()}
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