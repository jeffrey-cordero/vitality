import { faBan, faGears, faPenToSquare, faTag, faTags, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useCallback, useContext, useMemo, useReducer, useRef } from "react";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Confirmation from "@/components/global/confirmation";
import Error from "@/components/global/error";
import { Input } from "@/components/global/input";
import Loading from "@/components/global/loading";
import Modal from "@/components/global/modal";
import { formReducer, VitalityChildProps, VitalityProps, VitalityState } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { addWorkoutTag, Tag, updateWorkoutTag } from "@/lib/home/workouts/tags";

const form: VitalityState = {
   tagTitle: {
      id: "tagTitle",
      value: "",
      error: null
   },
   tagColor: {
      id: "tagColor",
      value: null,
      error: null,
      handlesChanges: true
   },
   tagSearch: {
      id: "tagSearch",
      value: "",
      error: null
   }
};

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
const values = Object.values(colors);
let randomColor: string = values[Math.floor(Math.random() * values.length)];

interface CreateTagProps extends VitalityChildProps {
   onSubmit: () => void;
}

function CreateTag(props: CreateTagProps) {
   const { localState, onSubmit } = props;
   const search: string = localState.tagSearch.value;

   return (
      <div
         tabIndex = { 0 }
         className = "mx-auto mb-2 mt-4 flex max-w-full cursor-pointer flex-row flex-wrap items-center justify-center gap-x-2 rounded-full px-5 py-[0.6rem] text-sm font-bold text-white  focus:outline-blue-500"
         style = { { backgroundColor: randomColor } }
         onClick = { onSubmit }
         onKeyDown = { (event: React.KeyboardEvent) => event.key === "Enter" && onSubmit() }
      >
         <p className = "mx-auto line-clamp-1 max-w-full cursor-pointer text-ellipsis break-all text-center">{ search }</p>
         <FontAwesomeIcon icon = { faTags } />
      </div>
   );
}

function TagColorSelection(props: VitalityChildProps) {
   const { localState, localDispatch } = props;

   const names = useMemo(() => {
      return Object.keys(colors);
   }, []);

   const updateColor = useCallback((color: string) => {
      localDispatch({
         type: "updateState",
         value: {
            id: "tagColor",
            value: {
               value: color,
               error: null
            }
         }
      });
   }, [localDispatch]);

   return (
      <div className = "relative mx-auto flex w-full flex-col gap-1">
         {
            names.map((name: string) => {
               const color: string = colors[name];

               return (
                  <Button
                     style = { { backgroundColor: color } }
                     className = {
                        clsx(
                           "flex h-[2.7rem] w-full cursor-pointer items-center justify-center rounded-lg border-2 p-1 text-center text-sm text-white transition duration-300 ease-in-out focus:border-0 xxsm:text-sm",
                           {
                              "scale-[1.07] border-gray-700 dark:border-gray-600": localState.tagColor.value === color,
                              "border-white dark:border-slate-800": localState.tagColor.value !== color
                           },
                        )
                     }
                     onClick = { () => updateColor(color) }
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

interface EditTagProps extends TagContainerProps {
   modalRef: React.MutableRefObject<{ open: () => void; close: () => void; isOpen: () => boolean }>;
}

function EditTag(props: EditTagProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { tag, globalState, globalDispatch, localState, localDispatch, modalRef } = props;
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const updateTag = useCallback(async(method: "update" | "delete") => {
      const payload: Tag = {
         user_id: user.id,
         id: tag.id,
         title: localState.tagTitle.value.trim(),
         color: localState.tagColor.value.trim()
      };

      const response: VitalityResponse<Tag> = await updateWorkoutTag(user.id, payload, method);

      if (response.status !== "Error") {
         // Handle success or failure responses
         processResponse(response, localDispatch, updateNotifications, () => {
            const { options, selected } = globalState.tags.data;
            const returnedTag: Tag = response.body.data as Tag;

            const mapOrFilter = method === "update" ?  (tag: Tag) => tag && tag.id === returnedTag.id ? returnedTag : tag
               : (tag: Tag) => tag !== undefined && tag.id !== returnedTag.id;

            const newTags: Tag[] = method === "update" ? [...options.map(mapOrFilter)] : [...options.filter(mapOrFilter)];
            const newSelected: Tag[] = method === "update" ? [...selected.map(mapOrFilter)] : [...selected.filter(mapOrFilter)];

            // Update existing workout tags dictionary
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
                  value: {
                     data: {
                        options: newTags,
                        selected: newSelected,
                        dictionary: newDictionary
                     }
                  }
               }
            });

            method === "delete" && updateNotifications({
               status: "Success",
               message: "Deleted workout tag",
               timer: 1000
            });

            modalRef.current?.close();
         });
      } else {
         // Handle error response by mapping response error to local inputs
         localDispatch({
            type: "updateStates",
            value: {
               tagTitle: {
                  error: response.body.errors["title"]?.[0] ?? null
               },
               tagColor: {
                  error: response.body.errors["color"]?.[0] ?? null
               }
            }
         });
      }
   },
   [
      user,
      tag.id,
      modalRef,
      globalState,
      localDispatch,
      globalDispatch,
      updateNotifications,
      localState.tagColor,
      localState.tagTitle
   ],
   );

   const submitTagUpdates = useCallback(() => {
      updateButtonRef.current?.submit();
   }, []);

   return (
      <div className = "flex flex-col items-stretch justify-center gap-3 text-center text-black dark:text-white">
         <div className = "flex flex-col items-center justify-center gap-3 text-center">
            <FontAwesomeIcon
               icon = { faTag }
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
            onSubmit = { submitTagUpdates }
            autoFocus
            required
         />
         <div className = "flex flex-col items-center justify-center gap-1">
            <TagColorSelection { ...props } />
            <Error message = { localState.tagColor.error } />
         </div>
         <div className = "flex flex-col gap-2">
            <Button
               ref = { updateButtonRef }
               type = "submit"
               className = "h-10 w-full bg-primary text-white"
               icon = { faPenToSquare }
               onSubmit = { () => updateTag("update") }
               onClick = { submitTagUpdates }
            >
               Update
            </Button>
            <Confirmation
               message = "Delete this tag?"
               onConfirmation = { async() => await updateTag("delete") }
            />
         </div>
      </div>
   );
}

interface TagContainerProps extends VitalityChildProps {
   tag: Tag;
   selected: boolean;
}

function TagContainer(props: TagContainerProps): JSX.Element {
   const { tag, selected, globalState, globalDispatch, localDispatch } = props;
   const tagRef = useRef<HTMLLIElement>(null);
   const editTagModalRef = useRef<{ open: () => void; close: () => void; isOpen: () => boolean }>(null);

   // Handle adding or removing a selected tag
   const selectedTag = useCallback((adding: boolean) => {
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            value: {
               data: {
                  selected: adding ? [...globalState.tags.data?.selected, tag]
                     : [...globalState.tags.data?.selected].filter(
                        (other: Tag) => other !== tag,
                     )
               }
            }
         }
      });
   }, [
      tag,
      globalDispatch,
      globalState.tags
   ]);

   const editTag = useCallback(() => {
      // Update editing tag inputs in local state
      localDispatch({
         type: "updateStates",
         value: {
            tagTitle: {
               value: tag.title,
               error: null
            },
            tagColor: {
               value: tag.color,
               error: null
            }
         }
      });
   }, [
      tag.color,
      tag.title,
      localDispatch
   ]);

   return (
      <li
         className = {
            clsx(
               "relative m-[0.4rem] rounded-full px-5 py-[0.6rem] text-[0.75rem] font-bold text-white xxsm:text-[0.8rem]",
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
         <div className = "mx-auto flex max-w-full flex-row items-center justify-center gap-x-2">
            <div
               id = { tag.id }
               onClick = { () => !selected && selectedTag(true) }
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
                           onClick = { editTag }
                           className = "cursor-pointer pt-1 text-sm hover:text-gray-400"
                        />
                     }
                     className = "mt-12 max-h-[90%] max-w-[95%] sm:max-w-xl"
                  >
                     <EditTag
                        modalRef = { editTagModalRef }
                        { ...props }
                     />
                  </Modal>
               }
               {
                  selected && (
                     <FontAwesomeIcon
                        onMouseDown = { () => selectedTag(false) }
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

export default function TagsForm(props: TagsProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { globalState, globalDispatch, onReset } = props;
   // Fetch overall and selected tags lists
   const { options, selected } = globalState.tags.data;
   const [localState, localDispatch] = useReducer(formReducer, form);

   // Determine if tags have been fetched from the server
   const fetched: boolean = globalState.tags.data?.fetched;

   // Differentiate between selected and unselected tags
   const selectedTags: Set<Tag> = useMemo(() => {
      return new Set<Tag>(selected);
   }, [selected]);

   const searchOptions = useMemo(() => {
      return options.filter(
         (tag: Tag) => !selectedTags.has(tag)
      );
   }, [
      options,
      selectedTags
   ]);

   // Search value for tags based on title
   const search: string = useMemo(() => {
      return localState.tagSearch.value.trim();
   }, [localState.tagSearch]);

   // Workout tag results through case-insensitive title comparison
   const searchResults: Tag[] = useMemo(() => {
      const lower = search.toLowerCase();

      return search === "" ? searchOptions
         : searchOptions.filter(
            (tag: Tag) => tag.title.toLowerCase().includes(lower)
         );
   }, [
      search,
      searchOptions
   ]);

   // Determine if search pattern already exists or may be used for a new workout tag
   const tagsByTitle: { [title: string]: Tag } = useMemo(() => {
      const titles = {};

      for (const tag of options) {
         titles[tag.title] = tag;
      }

      return titles;
   }, [options]);

   const createTag = useCallback(async() => {
      // Default tags have a random color assigned
      const tag: Tag = {
         user_id: user.id,
         id: "",
         title: localState.tagSearch.value.trim(),
         color: randomColor
      };

      const response: VitalityResponse<Tag> = await addWorkoutTag(user.id, tag);

      if (response.status !== "Error") {
         // Handle success or failure responses
         processResponse(response, localDispatch, updateNotifications, () => {
            // Add the new tag to the overall user tag options
            const newOption: Tag = response.body.data as Tag;

            const newOptions: Tag[] = [...globalState.tags.data?.options, newOption];
            const newSelected: Tag[] = [...globalState.tags.data?.selected, newOption];

            // Update existing workout tags dictionary
            const newDictionary: Record<string, Tag> = Object.fromEntries(
               newOptions.map((tag) => [tag.id, tag]),
            );

            globalDispatch({
               type: "updateState",
               value: {
                  id: "tags",
                  value: {
                     data: {
                        options: newOptions,
                        selected: newSelected,
                        dictionary: newDictionary
                     }
                  }
               }
            });

            // New random color for the next tag creation
            randomColor = values[Math.floor(Math.random() * values.length)];
         });
      } else {
         // Handle error response by mapping response errors to local
         localDispatch({
            type: "updateStates",
            value: {
               tagSearch: {
                  error: response.body.errors["title"]?.[0] ?? null
               }
            }
         });
      }
   }, [
      user,
      localDispatch,
      globalDispatch,
      globalState.tags,
      updateNotifications,
      localState.tagSearch
   ]);

   const createOrSelectTag = useCallback(() => {
      const existingTag: Tag = tagsByTitle[search];

      if (!existingTag) {
         createTag();
      } else {
         document.getElementById(existingTag.id)?.click();
      }
   }, [
      search,
      createTag,
      tagsByTitle
   ]);

   return (
      <div className = "relative">
         {
            fetched ? (
               <div className = "mx-auto flex w-full flex-col flex-wrap items-center justify-center">
                  {
                     globalState.tags.data?.selected?.length > 0 && (
                        <ul className = "flex flex-row flex-wrap items-center justify-center pb-2">
                           {
                              globalState.tags.data?.selected.map((selected: Tag) => {
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
                                 icon = { faBan }
                                 onClick = { onReset }
                                 className = "absolute right-[10px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-red-500"
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
                        onSubmit = { createOrSelectTag }
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
                        <CreateTag
                           { ...props }
                           localState = { localState }
                           localDispatch = { localDispatch }
                           onSubmit = { () => createTag() }
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