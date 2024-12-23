import { faArrowLeft, faArrowRight, faArrowsUpDown, faBan, faCalendar, faMagnifyingGlass, faTag, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useMemo, useRef } from "react";

import Button from "@/components/global/button";
import Heading from "@/components/global/heading";
import { Input } from "@/components/global/input";
import Modal from "@/components/global/modal";
import Select from "@/components/global/select";
import Tags from "@/components/home/workouts/tags";
import { sendErrorMessage, sendSuccessMessage } from "@/lib/global/response";
import { VitalityInputState, VitalityProps, VitalityState } from "@/lib/global/state";
import { Tag } from "@/lib/home/workouts/tags";
import { Workout } from "@/lib/home/workouts/workouts";

export function filterByTags(
   filteredTagIds: Set<string>,
   workout: Workout
): boolean {
   // Ensure tags within the given workout cover entire set of filtered tags
   let size: number = 0;

   for (const tagId of workout.tagIds) {
      if (filteredTagIds.has(tagId)) {
         size++;
      }
   }

   return size >= filteredTagIds.size;
}

export function filterByDate(
   globalState: VitalityState,
   workout: Workout
): boolean {
   // Apply filter using min and/or max date and specific filtering method (before, after, between)
   const dateFilter: string = globalState.dateFilter.value;
   const minDate: Date = new Date(globalState.minDate.value);
   const maxDate: Date = new Date(globalState.maxDate.value);

   switch (dateFilter) {
      case "Is on or after":
         return isNaN(minDate.getTime()) || workout.date >= minDate;
      case "Is on or before":
         return isNaN(maxDate.getTime()) || workout.date <= maxDate;
      default:
         return isNaN(minDate.getTime()) && isNaN(maxDate.getTime()) || workout.date >= minDate && workout.date <= maxDate;
   }
}

export function filterWorkout(
   globalState: VitalityState,
   workout: Workout,
   selectedTags: Set<string>,
   source: "tags" | "date" | "update"
): boolean {
   // Filter workout based on applied filtering types and source of filtering check
   const { appliedDateFiltering, appliedTagsFiltering } = globalState.workouts.data;

   const passesDateFiltering: boolean = (!appliedDateFiltering && source !== "date") || filterByDate(globalState, workout);
   const passesTagsFiltering: boolean = (!appliedTagsFiltering && source !== "tags") || filterByTags(selectedTags, workout);

   return passesDateFiltering && passesTagsFiltering;
}

interface DateInputProps extends VitalityProps {
   input: VitalityInputState;
}

function DateInput(props: DateInputProps) {
   const { input, globalState, globalDispatch } = props;
   const isMinDate: boolean = input === globalState.minDate;
   const icon: IconDefinition = isMinDate ? faArrowRight : faArrowLeft;

   return (
      <div className = "mt-2 flex flex-col items-center justify-center">
         <div className = "text-primary">
            <FontAwesomeIcon
               icon = { icon }
               className = "my-2 text-lg text-primary"
            />
         </div>
         <div className = "mx-auto w-full">
            <Input
               id = { isMinDate ? "minDate" : "maxDate" }
               type = "date"
               label = "Date"
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
   const filterModalRef = useRef<{ open: () => void; close: () => void; isOpen: () => boolean }>(null);
   const filterButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);
   const dateFilterType: string = globalState.dateFilter.value;

   const inputs = useMemo(() => ({
      "Is between": undefined,
      "Is on or after": globalState.minDate,
      "Is on or before": globalState.maxDate
   }), [
      globalState.minDate,
      globalState.maxDate
   ]);

   const handleApplyDateFilter = useCallback(async() => {
      // Handle potential invalid inputs
      const errors = {};

      const dateFilter: string = globalState.dateFilter.value;
      const minDate: Date = new Date(globalState.minDate.value);
      const maxDate: Date = new Date(globalState.maxDate.value);
      const isRangeType: boolean = dateFilter === "Is between";

      const validateDate = (date: Date, key: string) => {
         if (isNaN(date.getTime())) {
            errors[key] = ["Date must be non-empty"];
         }
      };

      // Invalid date input errors
      if (isRangeType || dateFilter === "Is on or after") {
         validateDate(minDate, "minDate");
      }

      if (isRangeType || dateFilter === "Is on or before") {
         validateDate(maxDate, "maxDate");
      }

      // Invalid range errors
      if (isRangeType && !Object.keys(errors).length && minDate > maxDate) {
         errors["minDate"] = errors["maxDate"] = ["Date range must be valid"];
      }

      if (Object.keys(errors).length > 0) {
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

         const filteredTagIds: Set<string> = new Set(
            globalState.tags.data.filtered.map(
               (tag: Tag) => tag.id
            )
         );

         const filteredWorkouts: Workout[] = [...globalState.workouts.value].filter(
            (workout: Workout) => filterWorkout(globalState, workout, filteredTagIds, "date")
         );

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
         document.getElementById("workoutsView")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
   }, [
      globalState,
      globalDispatch
   ]);

   const handleSubmitSearch = useCallback(() => {
      filterButtonRef.current?.submit();
   }, []);

   const handleResetDateFilter = useCallback(() => {
      // Fall back to tags filtering, if applicable
      const appliedTagsFiltering: boolean = globalState.workouts.data.appliedTagsFiltering;
      const filteredTagIds: Set<string> = new Set(
         globalState.tags.data.filtered.map(
            (tag: Tag) => tag.id
         )
      );

      const newFiltered: Workout[] = [...globalState.workouts.value].filter(
         (workout) => !appliedTagsFiltering || filterByTags(filteredTagIds, workout)
      );

      globalDispatch({
         type: "updateStates",
         value: {
            // Reset filtered workouts
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
               error: null
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
            // Reset view to the first page
            page: {
               ...globalState.page,
               error: null,
               value: 0
            }
         }
      });
   }, [
      globalDispatch,
      globalState.page,
      globalState.maxDate,
      globalState.minDate,
      globalState.dateFilter,
      globalState.workouts.data,
      globalState.workouts.value,
      globalState.tags.data.filtered
   ]);

   return (
      <Modal
         ref = { filterModalRef }
         display = {
            <Button
               type = "button"
               className = "h-10 w-full bg-primary text-sm font-semibold text-white xxsm:text-sm"
            >
               <FontAwesomeIcon
                  icon = { faCalendar }
                  className = "text-base"
               />
               Filter by Date
            </Button>
         }
         className = "max-w-xl"
      >
         <div className = "flex flex-col items-stretch justify-center gap-2 text-center">
            <FontAwesomeIcon
               icon = { faCalendar }
               className = "mt-6 text-3xl text-primary xxsm:text-4xl"
            />
            <h1 className = "text-xl font-bold xxsm:mb-2 xxsm:text-2xl">Filter by Date</h1>
            <div className = "relative mt-8">
               <FontAwesomeIcon
                  icon = { faBan }
                  onClick = { handleResetDateFilter }
                  className = "absolute right-[10px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-red-500"
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
                  inputs[dateFilterType] !== undefined ? (
                     <div className = "relative">
                        <DateInput
                           { ...props }
                           input = { inputs[dateFilterType] }
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
                           className = "my-2 text-lg text-primary"
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
                  ref = { filterButtonRef }
                  type = "button"
                  className = "mt-3 h-10 w-full bg-primary text-sm font-bold text-white"
                  icon = { faMagnifyingGlass }
                  onSubmit = { handleApplyDateFilter }
                  onClick = { handleSubmitSearch }
               >
                  Apply
               </Button>
            </div>
         </div>
      </Modal>
   );
}

function FilterByTags(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;
   const filterModalRef = useRef<{ open: () => void; close: () => void; isOpen: () => boolean }>(null);
   const filterButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const handleDisplayFilteredTags = useCallback(() => {
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

   const handleApplyTagsFilter = useCallback(async() => {
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            input: {
               ...globalState.tags,
               data: {
                  ...globalState.tags.data,
                  // Store filtered tags selection for future `handleDisplayFilteredTags` invocations
                  filtered: globalState.tags.data.selected
               }
            }
         }
      });

      const filteredTagIds: Set<string> = new Set(
         globalState.tags.data.selected.map(
            (tag: Tag) => tag.id
         )
      );

      const filteredWorkouts: Workout[] = [...globalState.workouts.value].filter(
         (workout: Workout) => filterWorkout(globalState, workout, filteredTagIds, "tags")
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
      document.getElementById("workoutsView")?.scrollIntoView({ behavior: "smooth", block: "start" });
   }, [
      globalState,
      globalDispatch
   ]);

   const handleSubmitSearch = useCallback(() => {
      filterButtonRef.current?.submit();
   }, []);

   const handleResetTagsFilter = useCallback(() => {
      // Fall back to date filtering, if applicable
      const appliedDateFiltering: boolean = globalState.workouts.data.appliedDateFiltering;

      const newFiltered: Workout[] = [...globalState.workouts.value].filter(
         (workout) => !appliedDateFiltering || filterByDate(globalState, workout)
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
               className = "h-10 w-full bg-primary text-sm font-semibold text-white xxsm:text-sm"
               onClick = { handleDisplayFilteredTags }
            >
               <FontAwesomeIcon
                  icon = { faTag }
                  className = "text-base text-white"
               />
               Filter by Tags
            </Button>
         }
         className = "max-w-xl"
      >
         <div className = "flex flex-col items-stretch justify-center gap-2 text-center">
            <FontAwesomeIcon
               icon = { faTag }
               className = "mt-6 text-3xl text-primary xxsm:text-4xl"
            />
            <h1 className = "text-xl font-bold xxsm:mb-2 xxsm:text-2xl">Filter by Tags</h1>
            <div className = "relative">
               <div className = "mx-auto my-2 w-full">
                  <Tags
                     { ...props }
                     onReset = { handleResetTagsFilter }
                  />
                  <Button
                     ref = { filterButtonRef }
                     type = "button"
                     className = "mt-3 h-10 w-full bg-primary font-bold text-white"
                     icon = { faMagnifyingGlass }
                     onSubmit = { handleApplyTagsFilter }
                     onClick = { handleSubmitSearch }
                  >
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
      <div className = "relative w-full sm:w-auto">
         <Heading
            title = "Workouts"
            description = "Create a new workout and let's make today count!"
         />
         <div className = "mx-auto my-4 flex w-full flex-col gap-2 px-2">
            <Input
               id = "search"
               type = "text"
               label = "Search"
               icon = { faMagnifyingGlass }
               input = { globalState.search }
               dispatch = { globalDispatch }
               autoFocus
            />
            <div className = "mx-auto grid w-full grid-cols-1 gap-2 xsm:grid-cols-2">
               <FilterByDate { ...props } />
               <FilterByTags { ...props } />
            </div>
         </div>
      </div>
   );
}