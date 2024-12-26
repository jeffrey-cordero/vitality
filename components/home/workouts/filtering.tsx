import { faArrowLeft, faArrowRight, faArrowsUpDown, faBan, faCalendar, faMagnifyingGlass, faTag, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useMemo, useRef } from "react";

import Button from "@/components/global/button";
import Heading from "@/components/global/heading";
import { Input } from "@/components/global/input";
import Modal from "@/components/global/modal";
import Select from "@/components/global/select";
import TagsForm from "@/components/home/workouts/tags";
import { VitalityInputState, VitalityProps, VitalityState } from "@/lib/global/reducer";
import { sendErrorMessage, sendSuccessMessage } from "@/lib/global/response";
import { Tag } from "@/lib/home/workouts/tags";
import { Workout } from "@/lib/home/workouts/workouts";

function filterByTags(filteredTagIds: Set<string>, workout: Workout): boolean {
   // Ensure tags within the given workout cover entire set of filtered tags
   let size: number = 0;

   for (const tagId of workout.tagIds) {
      if (filteredTagIds.has(tagId)) {
         size++;
      }
   }

   return size >= filteredTagIds.size;
}

function filterByDate(globalState: VitalityState, workout: Workout): boolean {
   // Apply date filter using min and/or max date with the specific filtering method (e.g., "Is on or after")
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

export function filterWorkout(globalState: VitalityState, workout: Workout, selectedTags: Set<string>, source: "tags" | "date" | "update"): boolean {
   // Filter workout based on applied filtering types and source of filtering request
   const { appliedDateFiltering, appliedTagsFiltering } = globalState.workouts.data;

   // Filtering application variables are applied after the source updates state
   const passesDateFiltering: boolean = (source !== "date" && !appliedDateFiltering) || filterByDate(globalState, workout);
   const passesTagsFiltering: boolean = (source !== "tags" && !appliedTagsFiltering) || filterByTags(selectedTags, workout);

   return passesDateFiltering && passesTagsFiltering;
}

interface SingleDateFilterProps extends VitalityProps {
   input: VitalityInputState;
}

function SingleDateFilter(props: SingleDateFilterProps) {
   // Applicable when filtering method is "Is on or after" or "Is on or before"
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

function DateFilter(props: VitalityProps): JSX.Element {
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

   const applyDateFilter = useCallback(async() => {
      const errors = {};

      const dateFilter: string = globalState.dateFilter.value;
      const isBetweenType: boolean = dateFilter === "Is between";
      const minDate: Date = new Date(globalState.minDate.value);
      const maxDate: Date = new Date(globalState.maxDate.value);

      const validateDate = (date: Date, input: string) => {
         if (isNaN(date.getTime())) {
            errors[input] = ["Date must be non-empty"];
         }
      };

      // Invalid date values
      (isBetweenType || dateFilter === "Is on or after") && validateDate(minDate, "minDate");
      (isBetweenType || dateFilter === "Is on or before") && validateDate(maxDate, "maxDate");

      // Invalid range errors, assuming "Is between" filtering method
      (isBetweenType && !Object.keys(errors).length && minDate > maxDate) && (
         errors["minDate"] = errors["maxDate"] = ["Date range must be valid"]
      );

      if (Object.keys(errors).length > 0) {
         globalDispatch({
            type: "processResponse",
            value: sendErrorMessage(
               "Invalid date filtering inputs",
               errors,
            )
         });
      } else {
         // Remove all errors, if any, and apply date filter for all potential workouts
         globalDispatch({
            type: "processResponse",
            value: sendSuccessMessage("Success", null)
         });

         const filteredTagIds: Set<string> = new Set(
            globalState.tags.data?.filtered.map(
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
               value: {
                  data: {
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

   const applyDateFilterUpdates = useCallback(() => {
      filterButtonRef.current?.submit();
   }, []);

   const resetDateFilter = useCallback(() => {
      // Fall back to tags filtering, if applicable
      const appliedTagsFiltering: boolean = globalState.workouts.data?.appliedTagsFiltering;
      const filteredTagIds: Set<string> = new Set(
         globalState.tags.data?.filtered.map(
            (tag: Tag) => tag.id
         )
      );

      const newFiltered: Workout[] = [...globalState.workouts.value].filter(
         (workout) => !appliedTagsFiltering || filterByTags(filteredTagIds, workout)
      );

      globalDispatch({
         type: "updateStates",
         value: {
            // Update filtered workouts
            workouts: {
               data: {
                  appliedDateFiltering: false,
                  filtered: newFiltered
               },
               value: globalState.workouts.value
            },
            // Reset date filtering inputs
            dateFilter: {
               error: null
            },
            minDate: {
               error: null,
               value: ""
            },
            maxDate: {
               error: null,
               value: ""
            },
            // Reset to first page view in pagination
            page: {
               error: null,
               value: 0
            }
         }
      });

      filterModalRef.current?.close();
   }, [
      globalDispatch,
      globalState.workouts.data,
      globalState.workouts.value,
      globalState.tags.data?.filtered
   ]);

   return (
      <Modal
         ref = { filterModalRef }
         display = {
            <Button
               type = "button"
               className = "h-10 w-full bg-primary font-semibold text-white text-sm xxsm:text-sm"
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
                  onClick = { resetDateFilter }
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
                        <SingleDateFilter
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
                  onSubmit = { applyDateFilter }
                  onClick = { applyDateFilterUpdates }
               >
                  Apply
               </Button>
            </div>
         </div>
      </Modal>
   );
}

function TagsFilter(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;
   const filterModalRef = useRef<{ open: () => void; close: () => void; isOpen: () => boolean }>(null);
   const filterButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const displayFilteredTags = useCallback(() => {
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            value: {
               data: {
                  selected: globalState.tags.data?.filtered
               }
            }
         }
      });
   }, [
      globalDispatch,
      globalState.tags
   ]);

   const applyTagsFilter = useCallback(async() => {
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            value: {
               data: {
                  // Cache filtered tags selection (selected represents current tag modal selection)
                  filtered: globalState.tags.data?.selected
               }
            }
         }
      });

      const filteredTagIds: Set<string> = new Set(
         globalState.tags.data?.selected.map(
            (tag: Tag) => tag.id
         )
      );

      const filteredWorkouts: Workout[] = [...globalState.workouts.value].filter(
         (workout: Workout) => filterWorkout(globalState, workout, filteredTagIds, "tags")
      );

      // Update filtered workouts
      globalDispatch({
         type: "updateState",
         value: {
            id: "workouts",
            value: {
               data: {
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

   const applyTagsFilterUpdates = useCallback(() => {
      filterButtonRef.current?.submit();
   }, []);

   const resetTagsFilter = useCallback(() => {
      // Fall back to date filtering, if applicable
      const appliedDateFiltering: boolean = globalState.workouts.data?.appliedDateFiltering;

      const newFiltered: Workout[] = [...globalState.workouts.value].filter(
         (workout) => !appliedDateFiltering || filterByDate(globalState, workout)
      );

      globalDispatch({
         type: "updateStates",
         value: {
            // Update filtered workouts
            workouts: {
               data: {
                  appliedTagsFiltering: false,
                  filtered: newFiltered
               },
               value: globalState.workouts.value
            },
            // Reset tag filtering inputs (selected and cached filtered tags)
            tags: {
               data: {
                  selected: [],
                  filtered: []
               },
               value: globalState.tags.value
            }
         }
      });

      filterModalRef.current?.close();
   }, [
      globalState,
      globalDispatch
   ]);

   return (
      <Modal
         ref = { filterModalRef }
         display = {
            <Button
               type = "button"
               className = "h-10 w-full bg-primary text-sm font-semibold text-white xxsm:text-sm"
               onClick = { displayFilteredTags }
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
                  <TagsForm
                     { ...props }
                     onReset = { resetTagsFilter }
                  />
                  <Button
                     ref = { filterButtonRef }
                     type = "button"
                     className = "mt-3 h-10 w-full bg-primary font-bold text-white"
                     icon = { faMagnifyingGlass }
                     onSubmit = { applyTagsFilter }
                     onClick = { applyTagsFilterUpdates }
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
      <div className = "relative w-full">
         <Heading
            title = "Workouts"
            message = "Create a new workout and let's make today count!"
         />
         <div className = "mx-auto my-4 flex w-full max-w-[35rem] flex-col gap-2 px-2 sm:w-11/12">
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
               <DateFilter { ...props } />
               <TagsFilter { ...props } />
            </div>
         </div>
      </div>
   );
}