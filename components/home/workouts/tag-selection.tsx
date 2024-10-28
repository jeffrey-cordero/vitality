import clsx from "clsx";
import Button from "@/components/global/button";
import Input from "@/components/global/input";
import { faGear, faXmark, faCloudArrowUp, faTrash, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addWorkoutTag, Tag, updateWorkoutTag } from "@/lib/workouts/tags";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { useCallback, useContext, useMemo, useReducer, useRef } from "react";
import { formReducer, handleResponse, VitalityChildProps, VitalityProps, VitalityResponse, VitalityState } from "@/lib/global/state";
import { PopUp } from "@/components/global/popup";
import { searchForTitle } from "@/lib/workouts/shared";
import Loading from "@/components/global/loading";

const form: VitalityState = {
   tagTitle: {
      value: "",
      error: null,
      data: {}
   },
   tagColor: {
      value: null,
      error: null,
      data: {
         handlesChanges: true
      }
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

interface CreateWorkoutTagProps extends VitalityChildProps {
   search: string;
   user_id: string;
}

function CreateWorkoutTag(props: CreateWorkoutTagProps) {
   const { search, user_id, globalState, globalDispatch, localDispatch } = props;
   const { updateNotification } = useContext(NotificationContext);

   const handleNewWorkoutTagSubmission = useCallback(async () => {
      // Default tags have gray color option
      const tag: Tag = {
         user_id: user_id,
         id: "",
         title: search,
         color: "rgb(90, 90, 90)"
      };

      const response: VitalityResponse<Tag> = await addWorkoutTag(tag);

      const successMethod = () => {
         // Add the new tag to the overall user tag options
         const newOption: Tag = response.body.data;

         const newOptions: Tag[] = [...globalState.tags.data.options, newOption];
         const newSelected: Tag[] = [...globalState.tags.data.selected, newOption];

         // Dictionary of tags are essential to ignore deleted tags applied to existing workouts
         const newDictionary: { [key: string]: Tag } = Object.fromEntries(newOptions.map(tag => [tag.id, tag]));

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

      handleResponse(localDispatch, response, successMethod, updateNotification);
   }, [globalDispatch, localDispatch, globalState.tags, search, user_id, updateNotification]);

   return (
      <div
         tabIndex={0}
         className="cursor-pointer transition duration-300 ease-in-out hover:bg-gray-100 p-3 rounded-2xl"
         onClick={() => {
            handleNewWorkoutTagSubmission();
         }}
         onKeyDown={(event) => {
            if (event.key === "Enter") {
               handleNewWorkoutTagSubmission();
            }
         }}
      >
         <h1>Create <span
            className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: "rgb(90, 90, 90)" }}>{search}</span></h1>
      </div>
   );
}

function TagColorPicker(props: VitalityChildProps) {
   const { localState, localDispatch } = props;

   const colorNames = useMemo(() => Object.keys(colors), []);

   const handleChangeColor = useCallback((color: string) => {
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
   }, [localDispatch, localState]);

   return (
      <>
         {colorNames.map((name: string) => {
            const color = colors[name];

            return (
               <div
                  style={{ backgroundColor: color }}
                  className={clsx("cursor-pointer w-full h-[3rem] border-[3px] rounded-sm p-3 text-white text-center", {
                     "border-primary scale-[1.02] shadow-2xl": localState.tagColor.value === color,
                     "border-white": localState.tagColor.value !== color
                  })}
                  onClick={() => handleChangeColor(color)}
                  key={name}
               >
                  {name}
               </div>
            );
         })}
      </>
   );
};

interface EditWorkoutTagProps extends WorkoutTagProps {
   onSave: () => void;
}

function EditWorkoutTag(props: EditWorkoutTagProps): JSX.Element {
   const { tag, globalState, globalDispatch, localState, localDispatch, onSave } = props;
   const { updateNotification } = useContext(NotificationContext);

   const handleEditWorkoutTagSubmission = useCallback(async (method: "update" | "delete") => {
      const payload: Tag = {
         user_id: tag.user_id,
         id: tag.id,
         title: localState.tagTitle.value.trim(),
         color: localState.tagColor.value.trim()
      };

      const response: VitalityResponse<Tag> = await updateWorkoutTag(payload, method);

      const successMethod = () => {
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

         // Close the pop up form element and scroll into editing tag element
         onSave();
      };

      if (response.status !== "Success") {
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
      } else {
         // Handle success or failure responses
         handleResponse(localDispatch, response, successMethod, updateNotification);
      }

   }, [globalDispatch, globalState, localDispatch, localState.tagColor, localState.tagTitle, tag.id, tag.user_id, updateNotification, onSave]);

   return (
      <div className="flex flex-col justify-center align-center text-center gap-3 text-black">
         <div className="flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon={faGear}
               className="text-6xl text-primary mt-1"
            />
            <h1 className="text-3xl font-bold text-black mb-2">
               Edit Workout Tag
            </h1>
         </div>
         <Input
            id="tagTitle"
            type="text"
            label="Title"
            icon={faTag}
            input={localState.tagTitle}
            dispatch={localDispatch}
            autoFocus
            required />
         <div className="flex flex-col justify-center items-center gap-2">
            <TagColorPicker {...props} />
            {localState.tagColor.error !== null &&
               <div className="flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                  <p className="text-red-500 font-bold input-error"> {localState.tagColor.error} </p>
               </div>
            }
         </div>
         <div>
            <Button
               type="submit"
               className="bg-red-500 text-white w-full h-[2.9rem]"
               icon={faTrash}
               onClick={() => handleEditWorkoutTagSubmission("delete")}
            >
               Delete
            </Button>
         </div>
         <div>
            <Button
               type="submit"
               className="bg-primary text-white w-full  h-[2.9rem]"
               icon={faCloudArrowUp}
               onClick={() => handleEditWorkoutTagSubmission("update")}
            >
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
   const { tag, selected, globalState, globalDispatch, localState, localDispatch } = props;
   const editTagPopUpRef = useRef<{ close: () => void }>(null);
   const tagRef = useRef<HTMLLIElement>(null);

   // Handle adding or removing a selected tag
   const handleSelectWorkoutTag = useCallback((adding: boolean) => {
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            input: {
               ...globalState.tags,
               data: {
                  ...globalState.tags.data,
                  // Add to selected options, if applicable, or remove
                  selected: adding ? [...globalState.tags.data.selected, tag]
                     : [...globalState.tags.data.selected].filter((other: Tag) => (other) !== tag)
               }
            }
         }
      });
   }, [globalDispatch, globalState.tags, tag]);

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
      editTagPopUpRef.current?.close();
      tagRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
   }, []);

   return (
      <li
         className={clsx("px-3 py-1 m-2 rounded-full text-sm lg:text-xs font-bold text-white transition duration-300 ease-in-out")}
         style={{
            backgroundColor: tag.color
         }}
         ref={tagRef}
         key={tag.id}
      >
         <div
            className="max-w-full mx-auto flex justify-center items-center gap-3 p-2"
            onClick={() => {
               if (!(selected)) {
                  handleSelectWorkoutTag(true);
               }
            }}
         >
            <div className="cursor-pointer max-w-full px-2 mx-auto line-clamp-1 break-all text-center text-ellipsis">
               {tag.title}
            </div>
            {
               <PopUp
                  className="max-w-2xl"
                  ref={editTagPopUpRef}
                  cover={
                     <FontAwesomeIcon
                        icon={faGear}
                        onClick={handleInitializeTagForm}
                        className="cursor-pointer text-xs hover:scale-125 transition duration-300 ease-in-out"
                     />
                  }
               >
                  <EditWorkoutTag
                     {...props}
                     onSave={handleEditTagSave} />
               </PopUp>
            }
            {
               selected &&
               <FontAwesomeIcon
                  onMouseDown={() => handleSelectWorkoutTag(false)}
                  icon={faXmark}
                  className="cursor-pointer text-md transition duration-300 ease-in-out hover:scale-125 hover:text-red-500"
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

   const fetched: boolean = globalState.tags.data.fetched;

   return (
      <div>
         {fetched ? (
            <div className="w-full mx-auto flex flex-col flex-wrap justify-center items-center">
               <ul
                  className={clsx("flex flex-col sm:flex-row flex-wrap justify-center items-center", {
                     "pb-3": globalState.tags.data.selected?.length > 0
                  })}>
                  {
                     globalState.tags.data.selected?.map((selected: Tag) => {
                        return (
                           selected !== undefined &&
                           <WorkoutTag
                              {...props}
                              localState={localState}
                              localDispatch={localDispatch}
                              tag={selected}
                              selected={true}
                              key={selected.id}
                           />
                        );
                     })
                  }
               </ul>
               <div className="w-full mx-auto">
                  <Input
                     id="tagSearch"
                     type="text"
                     input={localState.tagSearch}
                     label="Tags"
                     icon={faTag}
                     dispatch={localDispatch}
                  />
               </div>
               <ul
                  className={clsx("flex flex-col sm:flex-row flex-wrap justify-center items-center", {
                     "pt-3": results.length > 0 || search.trim().length > 0
                  })}>
                  {
                     results.length > 0 ? results.map((tag: Tag) => {
                        return <WorkoutTag
                           {...props}
                           localState={localState}
                           localDispatch={localDispatch}
                           globalState={globalState}
                           globalDispatch={globalDispatch}
                           tag={tag}
                           selected={false}
                           key={tag.id} />;
                     }) : search.trim().length > 0 && user !== undefined && tagsByTitle[search] === undefined && (
                        <CreateWorkoutTag
                           {...props}
                           localState={localState}
                           localDispatch={localDispatch}
                           search={search}
                           user_id={user.id} />
                     )
                  }
               </ul>
            </div>
         ) : (
            <div className="w-full h-full justify-center items-center py-12">
               <Loading />
            </div>
            )
         }
      </div>
   );
}