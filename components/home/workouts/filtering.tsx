import Button from "@/components/global/button";
import Select from "@/components/global/select";
import Heading from "@/components/global/heading";
import Modal from "@/components/global/modal";
import Tags from "@/components/home/workouts/tags";
import { Input } from "@/components/global/input";
import { VitalityInputState, VitalityProps, VitalityState } from "@/lib/global/state";
import { sendSuccessMessage, sendErrorMessage } from "@/lib/global/response";
import { Workout } from "@/lib/home/workouts/workouts";
import { faCalendar, faMagnifyingGlass, faArrowsUpDown, faArrowRight, faArrowLeft, faArrowRotateLeft, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useMemo, useRef } from "react";
import { Tag } from "@/lib/home/workouts/tags";

export function filterByTags(
   selectedTags: Set<string>,
   workout: Workout,
): boolean {
   // Ensure tags within the given workout cover entire set of filtered tags
   let size: number = 0;

   for (const tagId of workout.tagIds) {
      if (selectedTags.has(tagId)) {
         size++;
      }
   }

   return size >= selectedTags.size;
}

export function filterByDate(
   globalState: VitalityState,
   workout: Workout,
): boolean {
   // Apply date filter using min and/or max date and specific method (before, after, between)
   const dateFilter: string = globalState.dateFilter.value;
   const minDate: Date = new Date(globalState.minDate.value);
   const maxDate: Date = new Date(globalState.maxDate.value);

   switch (dateFilter) {
      case "Is on or after":
         return isNaN(minDate.getTime()) || workout.date >= minDate;
      case "Is on or before":
         return isNaN(maxDate.getTime()) || workout.date <= maxDate;
      default:
         return isNaN(minDate.getTime()) && isNaN(maxDate.getTime())
            || workout.date >= minDate && workout.date <= maxDate;
   }
}

export function filterWorkout(
   globalState: VitalityState,
   workout: Workout,
   selectedTags: Set<string>,
   source: "tags" | "date" | "update",
): boolean {
   // Filter by date and/or applied tags, if applicable for either method
   const { appliedDateFiltering, appliedTagsFiltering } =
      globalState.workouts.data;

   const passesDateFiltering: boolean =
      (!appliedDateFiltering && source !== "date") ||
      filterByDate(globalState, workout);
   const passesTagsFiltering: boolean =
      (!appliedTagsFiltering && source !== "tags") ||
      filterByTags(selectedTags, workout);

   return passesDateFiltering && passesTagsFiltering;
}

interface DateInputProps extends VitalityProps {
   input: VitalityInputState;
}

function DateInput(props: DateInputProps) {
   const { input, globalState, globalDispatch } = props;
   const isMinDate = input === globalState.minDate;
   const icon = isMinDate ? faArrowRight : faArrowLeft;

   return (
      <div className = "flex flex-col justify-center items-center mt-2">
         <div className = "text-primary">
            <FontAwesomeIcon
               icon = { icon }
               className = "text-lg text-primary my-2"
            />
         </div>
         <div className = "w-full mx-auto">
            <Input
               id = { isMinDate ? "minDate" : "maxDate" }
               type = "date"
               label = "Title"
               icon = { faCalendar }
               input = { input }
               dispatch = { globalDispatch }
               required
            />
         </div>
      </div>
   );
}

function FilterByDate(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;
   const filterModalRef = useRef<{ open: () => void; close: () => void }>(null);
   const dateFilterType: string = globalState.dateFilter.value;

   const inputs = useMemo(() => {
      return {
         "Is between": undefined,
         "Is on or after": globalState.minDate,
         "Is on or before": globalState.maxDate
      };
   }, [
      globalState.minDate,
      globalState.maxDate
   ]);

   const input: VitalityInputState | undefined = useMemo(() => {
      return inputs[dateFilterType];
   }, [inputs, dateFilterType]);

   const handleApplyFilterClick = useCallback(() => {
      // Handle invalid inputs
      const errors = {};

      const dateFilter: string = globalState.dateFilter.value;
      const minDate: Date = new Date(globalState.minDate.value);
      const maxDate: Date = new Date(globalState.maxDate.value);
      const isRange: boolean = dateFilter === "Is between";

      const validateDate = (date: Date, key: string) => {
         if (isNaN(date.getTime())) {
            errors[key] = ["Date must be non-empty"];
         }
      };

      // For range filtering, ensure both inputs are validated
      if (isRange || dateFilter === "Is on or after") {
         validateDate(minDate, "minDate");
      }

      if (isRange || dateFilter === "Is on or before") {
         validateDate(maxDate, "maxDate");
      }

      // Invalid range errors
      if (isRange && !Object.keys(errors).length && minDate > maxDate) {
         errors["minDate"] = errors["maxDate"] = ["Date range must be valid"];
      }

      if (Object.keys(errors).length > 0) {
         // Display all errors
         globalDispatch({
            type: "updateErrors",
            value: sendErrorMessage(
               "Invalid Date filter(s)",
               errors,
            )
         });
      } else {
         // Remove all errors, if any, and apply filter all available workouts
         globalDispatch({
            type: "updateErrors",
            value: sendSuccessMessage("Success", null)
         });

         // Fetch cached selected filtered tags
         const filteredTags: Set<string> = new Set(
            globalState.tags.data.filtered.map((tag: Tag) => tag.id),
         );

         const filteredWorkouts: Workout[] = [...globalState.workouts.value].filter(
            (workout: Workout) => {
               return filterWorkout(globalState, workout, filteredTags, "date");
            },
         );

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
                     appliedDateFiltering: true
                  }
               }
            }
         });

         filterModalRef.current?.close();
         document.getElementById("workoutsView")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
   }, [
      globalState,
      globalDispatch
   ]);

   const handleReset = useCallback(() => {
      // Resetting the date filter should fall back to only tag filtering, if applied
      const appliedTagsFiltering: boolean =
         globalState.workouts.data.appliedTagsFiltering;
      const filteredTags: Set<string> = new Set(
         globalState.tags.data.filtered.map((tag: Tag) => tag.id),
      );

      const newFiltered: Workout[] = [...globalState.workouts.value].filter(
         (workout) => {
            return !appliedTagsFiltering || filterByTags(filteredTags, workout);
         },
      );

      globalDispatch({
         type: "updateStates",
         value: {
            // Reset global filtered workouts
            workouts: {
               data: {
                  ...globalState.workouts.data,
                  appliedDateFiltering: false,
                  filtered: newFiltered
               },
               value: globalState.workouts.value
            },
            // Reset date filtering inputs
            dateFilter: {
               ...globalState.dateFilter,
               error: null,
               value: "Is on or after"
            },
            minDate: {
               ...globalState.minDate,
               error: null,
               value: ""
            },
            maxDate: {
               ...globalState.maxDate,
               error: null,
               value: ""
            },
            page: {
               ...globalState.page,
               error: null,
               value: 0
            }
         }
      });
   }, [
      globalDispatch,
      globalState.maxDate,
      globalState.minDate,
      globalState.dateFilter,
      globalState.workouts.data,
      globalState.workouts.value,
      globalState.page,
      globalState.tags.data.filtered
   ]);

   return (
      <Modal
         ref = { filterModalRef }
         display = {
            <Button
               type = "button"
               className = "bg-gray-200 text-black font-semibold w-full h-[2.5rem] text-sm">
               <FontAwesomeIcon
                  icon = { faCalendar }
                  className = "text-sm"
               />
               Filter by Date
            </Button>
         }
         className = "max-w-xl">
         <div className = "flex flex-col justify-center align-center text-center gap-2">
            <FontAwesomeIcon
               icon = { faCalendar }
               className = "text-4xl text-primary mt-6"
            />
            <h1 className = "text-2xl font-bold mb-2">Filter by Date</h1>
            <div className = "relative mt-8">
               <FontAwesomeIcon
                  icon = { faArrowRotateLeft }
                  onClick = { handleReset }
                  className = "absolute top-[-25px] right-[10px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <Select
                  id = "dateFilter"
                  type = "select"
                  values = { ["Is on or after", "Is on or before", "Is between"] }
                  input = { globalState.dateFilter }
                  label = "Type"
                  icon = { faCalendar }
                  dispatch = { globalDispatch }
                  autoFocus
               />
               {
                  input !== undefined ? (
                     // Min or max
                     <div>
                        <DateInput
                           { ...props }
                           input = { input }
                        />
                     </div>
                  ) : (
                     <div className = "my-2">
                        <Input
                           id = "minDate"
                           type = "date"
                           label = "Min"
                           icon = { faCalendar }
                           input = { globalState.minDate }
                           dispatch = { globalDispatch }
                           required
                        />
                        <FontAwesomeIcon
                           icon = { faArrowsUpDown }
                           className = "text-lg text-primary my-2"
                        />
                        <Input
                           id = "maxDate"
                           type = "date"
                           label = "Max"
                           icon = { faCalendar }
                           input = { globalState.maxDate }
                           dispatch = { globalDispatch }
                           required
                        />
                     </div>
                  )
               }
               <Button
                  type = "button"
                  className = "bg-primary text-white font-bold w-full h-[2.5rem] text-sm mt-3"
                  icon = { faMagnifyingGlass }
                  onClick = { handleApplyFilterClick }>
                  Apply
               </Button>
            </div>
         </div>
      </Modal>
   );
}

function FilterByTags(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;
   const filterModalRef = useRef<{ open: () => void; close: () => void }>(null);

   const handleInitializeFilteredTags = useCallback(() => {
      // Selected tags are fetched from prior tag filter form batch
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            input: {
               ...globalState.tags,
               data: {
                  ...globalState.tags.data,
                  selected: globalState.tags.data.filtered
               }
            }
         }
      });
   }, [
      globalState.tags,
      globalDispatch
   ]);

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
                  filtered: globalState.tags.data.selected
               }
            }
         }
      });

      // Selected tags represents current tag filtering form value
      const filteredTags: Set<string> = new Set(
         globalState.tags.data.selected.map((tag: Tag) => tag.id),
      );

      const filteredWorkouts: Workout[] = [...globalState.workouts.value].filter(
         (workout: Workout) => {
            return filterWorkout(globalState, workout, filteredTags, "tags");
         },
      );

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
                  appliedTagsFiltering: true
               }
            }
         }
      });

      filterModalRef.current?.close();
      document.getElementById("workoutsView")
         ?.scrollIntoView({ behavior: "smooth", block: "start" });
   }, [
      globalState,
      globalDispatch
   ]);

   const handleReset = useCallback(() => {
      // Resetting the tags filter should fall back to date filtering, if applied
      const appliedDateFiltering: boolean =
         globalState.workouts.data.appliedDateFiltering;

      // All selected and filtered workouts remain the same, but additional filtered may be added as tag filter is removed
      const newFiltered: Workout[] = [...globalState.workouts.value].filter(
         (workout) => {
            return !appliedDateFiltering || filterByDate(globalState, workout);
         },
      );

      globalDispatch({
         type: "updateStates",
         value: {
            workouts: {
               data: {
                  ...globalState.workouts.data,
                  appliedTagsFiltering: false,
                  filtered: newFiltered
               },
               value: globalState.workouts.value
            },
            tags: {
               data: {
                  ...globalState.tags.data,
                  selected: [],
                  filtered: []
               },
               value: globalState.tags.value
            }
         }
      });
   }, [
      globalDispatch,
      globalState
   ]);

   return (
      <Modal
         ref = { filterModalRef }
         display = {
            <Button
               type = "button"
               className = "bg-gray-200 text-black font-semibold w-full h-[2.4rem] text-sm"
               onClick = { handleInitializeFilteredTags }>
               <FontAwesomeIcon
                  icon = { faTag }
                  className = "text-sm"
               />
               Filter by Tags
            </Button>
         }
         className = "max-w-xl">
         <div className = "flex flex-col justify-center align-center text-center gap-2">
            <FontAwesomeIcon
               icon = { faTag }
               className = "text-4xl text-primary mt-6"
            />
            <h1 className = "text-2xl font-bold mb-2">Filter by Tags</h1>
            <div className = "relative">
               <div className = "w-full mx-auto my-2">
                  <Tags
                     { ...props }
                     onReset = { handleReset }
                  />
                  <Button
                     type = "button"
                     className = "bg-primary text-white font-bold w-full h-[2.4rem] text-sm mt-3"
                     icon = { faMagnifyingGlass }
                     onClick = { handleApplyFilterClick }>
                     Apply
                  </Button>
               </div>
            </div>
         </div>
      </Modal>
   );
}

export default function Filtering(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;

   return (
      <div className = "relative">
         <Heading
            title = "Workouts"
            description = "Ready to crush your goals? Create a new workout and let's make today count!"
         />
         <div className = "w-full mx-auto flex flex-col gap-2 px-4 my-4">
            <Input
               id = "search"
               type = "text"
               label = "Search"
               icon = { faMagnifyingGlass }
               input = { globalState.search }
               dispatch = { globalDispatch }
               autoFocus
            />
            <div className = "w-full mx-auto grid grid-cols-1 xsm:grid-cols-2 gap-2">
               <FilterByDate { ...props } />
               <FilterByTags { ...props } />
            </div>
         </div>
      </div>
   );
}