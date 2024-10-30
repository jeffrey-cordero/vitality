import Button from "@/components/global/button";
import Input from "@/components/global/input";
import Select from "@/components/global/select";
import { PopUp } from "@/components/global/popup";
import { sendErrorMessage, sendSuccessMessage, VitalityInputState, VitalityProps, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faCalendar, faMagnifyingGlass, faArrowsUpDown, faArrowRight, faArrowLeft, faArrowRotateLeft, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useMemo, useRef } from "react";
import { TagSelection } from "@/components/home/workouts/tag-selection";
import { Tag } from "@/lib/workouts/tags";

export function filterByTags(selectedTags: Set<string>, workout: Workout): boolean {
   // Ensure tags within the given workout cover entire provided set of tag id's
   let size: number = 0;

   for (const tagId of workout.tagIds) {
      if (selectedTags.has(tagId)) {
         size++;
      }
   }

   return size >= selectedTags.size;
}

export function filterByDate(globalState: VitalityState, workout: Workout): boolean {
   // Apply date filter using min and/or max date and specific method (before, after, between)
   const dateFilter: string = globalState.type.value;
   const minDate: Date = new Date(globalState.min.value);
   const maxDate: Date = new Date(globalState.max.value);

   switch (dateFilter) {
      case "Is on or after":
         return isNaN(minDate.getTime()) || workout.date >= minDate;
      case "Is on or before":
         return workout.date <= maxDate;
      default:
         return workout.date >= minDate && workout.date <= maxDate;
   }
}


export function filterWorkout(globalState: VitalityState, workout: Workout, selectedTags: Set<string>, source: "tags" | "date" | "update"): boolean {
   // Filter by date and/or applied tags, if applicable for either method
   const { dateFiltered, tagsFiltered } = globalState.workouts.data;

   const passesDateFiltering: boolean = ((!(dateFiltered) && source !== "date")) || (filterByDate(globalState, workout));
   const passesTagsFiltering: boolean = ((!(tagsFiltered) && source !== "tags")) || (filterByTags(selectedTags, workout));

   return passesDateFiltering && passesTagsFiltering;
}

export function getFilteredDateWorkouts(props: VitalityProps): Workout[] | null {
   const { globalState, globalDispatch } = props;

   // Handle invalid inputs
   const errors = {};

   const filter: string = globalState.type.value;
   const minDate: Date = new Date(globalState.min.value);
   const maxDate: Date = new Date(globalState.max.value);
   const isRange: boolean = filter === "Is between";

   const validateDate = (date: Date, key: string) => {
      if (isNaN(date.getTime())) {
         errors[key] = ["Date must be non-empty"];
      }
   };

   // For range method, both date inputs are validated
   if (isRange || filter === "Is on or after") {
      validateDate(minDate, "min");
   }

   if (isRange || filter === "Is on or before") {
      validateDate(maxDate, "max");
   }

   // Invalid range errors
   if (isRange && !(Object.keys(errors).length) && minDate > maxDate) {
      errors["min"] = errors["max"] = ["Date range must be valid"];
   }

   if (Object.keys(errors).length > 0) {
      // Display all errors
      globalDispatch({
         type: "updateErrors",
         value: sendErrorMessage<null>("Error", "Invalid Date filter(s)", null, errors)
      });
   } else {
      // Remove all errors, if any, and apply filter all available workouts
      globalDispatch({
         type: "updateErrors",
         value: sendSuccessMessage<null>("Success", null)
      });

      // Fetch cached selected filtered tags
      const selectedTags: Set<string> = new Set(
         globalState.tags.data.filteredSelected.map((tag: Tag) => tag.id)
      );

      const filteredWorkouts: Workout[] = [...globalState.workouts.value].filter((workout: Workout) => {
         return filterWorkout(globalState, workout, selectedTags, "date");
      });

      return filteredWorkouts;
   }

   return null;
}

interface DateInputProps extends VitalityProps {
   input: VitalityInputState;
}

function DateInput(props: DateInputProps) {
   const { input, globalState, globalDispatch } = props;
   const isMinDate = input === globalState.min;
   const icon = isMinDate ? faArrowRight : faArrowLeft;

   return (
      <div className = "flex flex-col justify-center items-center mt-2">
         <div className = "text-primary">
            <FontAwesomeIcon
               icon = {icon}
               className = "text-lg text-primary my-2"
            />
         </div>
         <div className = "w-full mx-auto">
            <Input
               id = {isMinDate ? "min" : "max"}
               type = "date"
               label = "Title"
               icon = {faCalendar}
               input = {input}
               dispatch = {globalDispatch}
               required />
         </div>
      </div>
   );
}

function FilterByDate(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;
   const filterPopUpRef = useRef<{ close: () => void }>(null);
   const type: string = globalState.type.value;

   const inputs: { [key: string]: VitalityInputState | undefined } = useMemo(() => {
      return {
         "Is between": undefined,
         "Is on or after": globalState.min,
         "Is on or before": globalState.max
      };
   }, [globalState.min, globalState.max]);

   const input: VitalityInputState | undefined = useMemo(() => {
      return inputs[type];
   }, [inputs, type]);

   const handleApplyFilterClick = useCallback(() => {
      const filteredWorkouts: Workout[] | null = getFilteredDateWorkouts(props);

      if (filteredWorkouts !== null) {
         // Update filtered state for global state
         globalDispatch({
            type: "updateState",
            value: {
               id: "workouts",
               input: {
                  ...globalState.workouts,
                  data: {
                     ...globalState.workouts.data,
                     filtered: filteredWorkouts,
                     dateFiltered: true
                  }
               }
            }
         });

         filterPopUpRef.current?.close();
         document.getElementById("workoutsView")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
   }, [props, globalState.workouts, globalDispatch]);

   const handleReset = useCallback(() => {
      // Resetting the date filter should fall back to tags filtered view, if applied
      const tagsFiltered: boolean = globalState.workouts.data.tagsFiltered;
      const selectedTags: Set<string> = new Set(
         globalState.tags.data.filteredSelected.map((tag: Tag) => tag.id)
      );

      // All selected and filtered workouts remain the same, but additional filtered may be added as date filter is removed
      const newFiltered: Workout[] = [...globalState.workouts.value].filter((workout) => {
         return (!(tagsFiltered) || filterByTags(selectedTags, workout));
      });

      globalDispatch({
         type: "updateStates",
         value: {
            // Reset global filtered workouts
            workouts: {
               data: {
                  ...globalState.workouts.data,
                  dateFiltered: false,
                  filtered: newFiltered
               },
               value: globalState.workouts.value
            },
            // Reset date filtering inputs
            type: {
               ...globalState.type,
               value: "Is on or after"
            },
            min: {
               ...globalState.min,
               value: ""
            },
            max: {
               ...globalState.max,
               value: ""
            },
            // Reset to first page view
            paging: {
               data: {
                  ...globalState.paging.data,
                  page: 0
               },
               value: globalState.paging.value
            }
         }
      });
   }, [globalDispatch, globalState.max, globalState.min, globalState.type, globalState.workouts.data,
      globalState.workouts.value, globalState.paging.data, globalState.paging.value,
      globalState.tags.data.filteredSelected]);

   return (
      <PopUp
         className = "max-w-xl"
         ref = {filterPopUpRef}
         display = {
            <Button
               type = "button"
               className = "bg-gray-300 text-black font-semibold w-full h-[2.6rem] text-sm"
            >
               <FontAwesomeIcon
                  icon = {faCalendar}
                  className = "text-md" />
               Filter by Date
            </Button>
         }
      >
         <div className = "flex flex-col justify-center align-center text-center gap-2">
            <FontAwesomeIcon
               icon = {faCalendar}
               className = "text-3xl text-primary mt-1"
            />
            <h1 className = "text-2xl font-bold text-black mb-2">
               Filter by Date
            </h1>
            <div className = "relative mt-8">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {handleReset}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <Select
                  id = "type"
                  type = "select"
                  values = {["Is on or after", "Is on or before", "Is between"]}
                  input = {globalState.type}
                  label = "Type"
                  icon = {faCalendar}
                  dispatch = {globalDispatch} />
               {
                  input !== undefined ? (
                     // Min or max
                     <div>
                        <DateInput
                           {...props}
                           input = {input} />
                     </div>
                  ) : (
                     // Range (Min and Max Date Input's)
                     <div className = "my-2">
                        <Input
                           id = "min"
                           type = "date"
                           label = "Min"
                           icon = {faCalendar}
                           input = {globalState.min}
                           dispatch = {globalDispatch}
                           required />
                        <FontAwesomeIcon
                           icon = {faArrowsUpDown}
                           className = "text-lg text-primary my-2"
                        />
                        <Input
                           id = "max"
                           type = "date"
                           label = "Max"
                           icon = {faCalendar}
                           input = {globalState.max}
                           dispatch = {globalDispatch}
                           required />
                     </div>
                  )
               }
               <Button
                  type = "button"
                  className = "bg-primary text-white font-bold w-full h-[2.6rem] text-sm mt-3"
                  icon = {faMagnifyingGlass}
                  onClick = {handleApplyFilterClick}
               >
                  Apply
               </Button>
            </div>
         </div>
      </PopUp>
   );
}

function FilterByTags(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;
   const filterPopUpRef = useRef<{ close: () => void }>(null);

   const handleInitializeFilteredTags = useCallback(() => {
      // Selected tags are applied from prior filter form selection
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            input: {
               ...globalState.tags,
               data: {
                  ...globalState.tags.data,
                  selected: globalState.tags.data.filteredSelected
               }
            }
         }
      });
   }, [globalState.tags, globalDispatch]);

   const handleApplyFilterClick = useCallback(() => {
      // Cache filtered tags selection
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            input: {
               ...globalState.tags,
               data: {
                  ...globalState.tags.data,
                  filteredSelected: globalState.tags.data.selected
               }
            }
         }
      });

      // Selected filtered tags from filter form
      const selectedTags: Set<string> = new Set(
         globalState.tags.data.selected.map((tag: Tag) => tag.id)
      );

      const filteredWorkouts: Workout[] = [...globalState.workouts.value].filter((workout: Workout) => {
         return filterWorkout(globalState, workout, selectedTags, "tags");
      });

      if (filteredWorkouts !== null) {
         // Update filtered workouts state after applying tags filtering
         globalDispatch({
            type: "updateState",
            value: {
               id: "workouts",
               input: {
                  ...globalState.workouts,
                  data: {
                     ...globalState.workouts.data,
                     filtered: filteredWorkouts,
                     tagsFiltered: true
                  }
               }
            }
         });

         filterPopUpRef.current?.close();
         document.getElementById("workoutsView")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
   }, [globalState, globalDispatch]);

   const handleReset = useCallback(() => {
      // Resetting the tags filter should fall back to date filtered view, if applied
      const dateFiltered: boolean = globalState.workouts.data.dateFiltered;

      // All selected and filtered workouts remain the same, but additional filtered may be added as tag filter is removed
      const newFiltered: Workout[] = [...globalState.workouts.value].filter((workout) => {
         return (!(dateFiltered) || filterByDate(globalState, workout));
      });

      globalDispatch({
         type: "updateStates",
         value: {
            // Reset global filtered workouts
            workouts: {
               data: {
                  ...globalState.workouts.data,
                  tagsFiltered: false,
                  filtered: newFiltered
               },
               value: globalState.workouts.value
            },
            // Selected and filtered selected should reset to empty lists
            tags: {
               data: {
                  ...globalState.tags.data,
                  selected: [],
                  filteredSelected: []
               },
               value: globalState.tags.value
            }
         }
      });
   }, [globalDispatch, globalState]);

   return (
      <PopUp
         className = "max-w-xl"
         ref = {filterPopUpRef}
         display = {
            <Button
               type = "button"
               className = "bg-gray-300 text-black font-semibold w-full h-[2.6rem] text-sm"
               onClick = {handleInitializeFilteredTags}
            >
               <FontAwesomeIcon
                  icon = {faTag}
                  className = "text-md" />
               Filter by Tags
            </Button>
         }
      >
         <div className = "flex flex-col justify-center align-center text-center gap-2">
            <FontAwesomeIcon
               icon = {faTag}
               className = "text-3xl text-primary mt-1"
            />
            <h1 className = "text-2xl font-bold text-black mb-2">
               Filter by Tags
            </h1>
            <div className = "relative mt-8">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {handleReset}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <div className = "w-full mx-auto my-2">
                  <TagSelection {...props} />
                  <Button
                     type = "button"
                     className = "bg-primary text-white font-bold w-full h-[2.6rem] text-sm mt-3"
                     icon = {faMagnifyingGlass}
                     onClick = {handleApplyFilterClick}
                  >
                     Apply
                  </Button>
               </div>
            </div>
         </div>
      </PopUp>
   );
}

export default function WorkoutFiltering(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;

   return (
      <div className = "w-full mx-auto grid grid-rows-2 gap-4 px-4">
         <div className = "row-span-1 col-span-full">
            <Input
               id = "search"
               type = "text"
               label = "Search"
               icon = {faMagnifyingGlass}
               input = {globalState.search}
               dispatch = {globalDispatch}
               autoFocus />
         </div>
         <div className = "w-full mx-auto grid grid-cols-2 gap-2">
            <FilterByDate {...props} />
            <FilterByTags {...props} />
         </div>
      </div>
   );
}