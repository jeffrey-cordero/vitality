import clsx from "clsx";
import Button from "@/components/global/button";
import Loading from "@/components/global/loading";
import Confirmation from "@/components/global/confirmation";
import Modal from "@/components/global/modal";
import { Input } from "@/components/global/input";
import { faGear, faXmark, faCloudArrowUp, faTag, faArrowRotateLeft, faGears, faTags } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addWorkoutTag, updateWorkoutTag, Tag } from "@/lib/home/workouts/tags";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { useCallback, useContext, useMemo, useReducer, useRef } from "react";
import { VitalityChildProps, VitalityProps, VitalityState, formReducer } from "@/lib/global/state";
import { handleResponse, VitalityResponse } from "@/lib/global/response";

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
   "Dark gray": "rgb(55, 55, 55)",
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
         tabIndex = { 0 }
         className = "mx-auto mb-2 mt-4 flex max-w-full cursor-pointer flex-row flex-wrap items-center justify-center gap-x-2 rounded-full px-5 py-[0.6rem] text-sm font-bold text-white transition duration-300 ease-in-out hover:scale-[1.03] focus:scale-[1.03] focus:outline-blue-500"
         style = { { backgroundColor: randomColor } }
         onClick = { onSubmit }
         onKeyDown = {
            (event: React.KeyboardEvent) => {
               if (event.key === "Enter") {
                  onSubmit();
               }
            }
         }
      >
         <p className = "mx-auto line-clamp-1 max-w-full cursor-pointer text-ellipsis break-all text-center">{ search }</p>
         <FontAwesomeIcon icon = { faTags } />

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
      <div className = "relative mx-auto flex w-full flex-col gap-1">
         {
            names.map((name: string) => {
               const color = colors[name];

               return (
                  <Button
                     style = { { backgroundColor: color } }
                     className = {
                        clsx(
                           "flex h-[2.7rem] w-full cursor-pointer items-center justify-center rounded-lg border-2 p-1 text-center text-sm text-white focus:border-0",
                           {
                              "border-primary border-[3px] shadow-2xl": localState.tagColor.value === color,
                              "border-white dark:border-slate-800": localState.tagColor.value !== color
                           },
                        )
                     }
                     onClick = { () => handleColorChange(color) }
                     key = { name }
                  >
                     { name }
                  </Button>
               );
            })
         }
      </div>
   );
}

interface EditTagContainerProps extends TagContainerProps {
   onSave: () => void;
}

function EditTagContainer(props: EditTagContainerProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const { tag, globalState, globalDispatch, localState, localDispatch, onSave } = props;

   const handleTagUpdates = useCallback(
      async(method: "update" | "delete") => {
         const payload: Tag = {
            user_id: user.id,
            id: tag.id,
            title: localState.tagTitle.value.trim(),
            color: localState.tagColor.value.trim()
         };

         const response: VitalityResponse<Tag> = await updateWorkoutTag(
            user.id,
            payload,
            method,
         );

         if (response.status !== "Error") {
            // Handle success or failure responses
            handleResponse(response, localDispatch, updateNotification, () => {
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
               const newDictionary: Record<string, Tag> = Object.fromEntries(
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

               updateNotification({
                  status: "Success",
                  message: `${method === "delete" ? "Deleted" : "Updated"} workout tag`,
                  timer: 1000
               });

               // Close the modal form element and scroll into editing tag element
               onSave();
            });
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
         user,
         globalDispatch,
         globalState,
         localDispatch,
         localState.tagColor,
         localState.tagTitle,
         tag.id,
         updateNotification,
         onSave
      ],
   );

   return (
      <div className = "flex flex-col items-stretch justify-center gap-3 text-center text-black dark:text-white">
         <div className = "flex flex-col items-center justify-center gap-3 text-center">
            <FontAwesomeIcon
               icon = { faGear }
               className = "mt-6 text-5xl text-primary"
            />
            <h1 className = "mb-2 px-2 text-2xl font-bold">
               Edit Tag
            </h1>
         </div>
         <Input
            id = "tagTitle"
            type = "text"
            label = "Title"
            icon = { faTag }
            input = { localState.tagTitle }
            dispatch = { localDispatch }
            onSubmit = { () => handleTagUpdates("update") }
            autoFocus
            required
         />
         <div className = "flex flex-col items-center justify-center gap-1">
            <TagColorInput { ...props } />
            {
               localState.tagColor.error !== null && (
                  <div className = "mx-auto flex max-w-[90%] animate-fadeIn items-center justify-center gap-2 p-3 opacity-0">
                     <p className = "input-error font-bold text-red-500">
                        { localState.tagColor.error }
                     </p>
                  </div>
               )
            }
         </div>
         <div className = "flex flex-col gap-2">
            <Confirmation
               message = "Delete this tag?"
               onConfirmation = { () => handleTagUpdates("delete") }
            />
            <Button
               type = "submit"
               className = "h-[2.4rem] w-full bg-primary text-white"
               icon = { faCloudArrowUp }
               onClick = { () => handleTagUpdates("update") }
            >
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
         className = {
            clsx(
               "relative m-2 rounded-full px-5 py-2 text-[0.8rem] font-bold text-white",
            )
         }
         style = {
            {
               backgroundColor: tag.color
            }
         }
         ref = { tagRef }
         key = { tag.id }
      >
         <div className = "mx-auto flex max-w-full flex-row flex-wrap items-center justify-center gap-x-2">
            <div
               id = { tag.id }
               onClick = {
                  (event) => {
                     event.stopPropagation();

                     if (!selected) {
                        handleTagSelect(true);
                     }
                  }
               }
               className = "mx-auto line-clamp-1 max-w-full cursor-pointer text-ellipsis break-all text-center"
            >
               { tag.title }
            </div>
            <div className = "flex flex-row items-center justify-center gap-1">
               {
                  <Modal
                     ref = { editTagModalRef }
                     display = {
                        <FontAwesomeIcon
                           icon = { faGears }
                           onClick = { handleTagEdits }
                           className = "cursor-pointer pt-1 text-sm hover:text-primary"
                        />
                     }
                     className = "mt-12 max-h-[90%] max-w-[95%] sm:max-w-xl"
                  >
                     <EditTagContainer
                        { ...props }
                        onSave = { handleTagSave }
                     />
                  </Modal>
               }
               {
                  selected && (
                     <FontAwesomeIcon
                        onMouseDown = { () => handleTagSelect(false) }
                        icon = { faXmark }
                        className = "cursor-pointer text-base hover:text-red-500"
                     />
                  )
               }
            </div>
         </div>
      </li>
   );
}

interface TagsProps extends VitalityProps {
   onReset?: () => void;
}

export default function Tags(props: TagsProps): JSX.Element {
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

      const response: VitalityResponse<Tag> = await addWorkoutTag(user.id, tag);

      if (response.status !== "Error") {
         // Handle success or failure responses
         handleResponse(response, localDispatch, updateNotification, () => {
            // Add the new tag to the overall user tag options
            const newOption: Tag = response.body.data as Tag;

            const newOptions: Tag[] = [...globalState.tags.data.options, newOption];
            const newSelected: Tag[] = [...globalState.tags.data.selected, newOption];

            // Dictionary of tags are essential to ignore deleted tags applied to existing workouts
            const newDictionary: Record<string, Tag> = Object.fromEntries(
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

            updateNotification({
               status: "Success",
               message: "Added workout tag",
               timer: 1000
            });

            // Fetch a new random color
            randomColor = colorValues[Math.floor(Math.random() * colorValues.length)];
         });
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

   const handleCreateOrSelectTag = useCallback(() => {
      const existingTag: Tag = tagsByTitle[search];

      if (!existingTag) {
         handleTagCreation();
      } else {
         document.getElementById(existingTag.id)?.click();
      }
   }, [
      search,
      tagsByTitle,
      handleTagCreation
   ]);

   return (
      <div className = "relative">
         {
            fetched ? (
               <div className = "mx-auto flex w-full flex-col flex-wrap items-center justify-center">
                  {
                     globalState.tags.data.selected?.length > 0 && (
                        <ul className = "flex flex-row flex-wrap items-center justify-center pb-2">
                           {
                              globalState.tags.data.selected.map((selected: Tag) => {
                                 return (
                                    selected !== undefined && (
                                       <TagContainer
                                          { ...props }
                                          localState = { localState }
                                          localDispatch = { localDispatch }
                                          tag = { selected }
                                          selected = { true }
                                          key = { selected.id }
                                       />
                                    )
                                 );
                              })
                           }
                        </ul>
                     )
                  }
                  <div className = "relative mx-auto w-full">
                     {
                        onReset && (
                           <div className = "relative mt-6">
                              <FontAwesomeIcon
                                 icon = { faArrowRotateLeft }
                                 onClick = { onReset }
                                 className = "absolute right-[10px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-primary"
                              />
                           </div>
                        )
                     }
                     <Input
                        id = "tagSearch"
                        type = "text"
                        input = { localState.tagSearch }
                        label = "Tags"
                        icon = { faTag }
                        dispatch = { localDispatch }
                        onSubmit = { handleCreateOrSelectTag }
                        autoFocus = { onReset !== undefined }
                     />
                  </div>
                  {
                     searchResults.length > 0 && (
                        <ul className = "flex flex-row flex-wrap items-center justify-center pt-2">
                           {
                              searchResults.map((tag: Tag) => {
                                 return (
                                    <TagContainer
                                       { ...props }
                                       localState = { localState }
                                       localDispatch = { localDispatch }
                                       globalState = { globalState }
                                       globalDispatch = { globalDispatch }
                                       tag = { tag }
                                       selected = { false }
                                       key = { tag.id }
                                    />
                                 );
                              })
                           }
                        </ul>
                     )
                  }
                  {
                     search.length >= 3 && search.length <= 30 && !tagsByTitle[search] && (
                        <CreateTagContainer
                           { ...props }
                           localState = { localState }
                           localDispatch = { localDispatch }
                           onSubmit = { () => handleTagCreation() }
                        />
                     )
                  }
               </div>
            ) : (
               <div className = "size-full items-center justify-center py-12">
                  <Loading />
               </div>
            )
         }
      </div>
   );
}