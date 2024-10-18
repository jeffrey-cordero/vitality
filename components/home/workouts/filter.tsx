import Button from "@/components/global/button";
import Input from "@/components/global/input";
import Select from "@/components/global/select";
import { PopUp } from "@/components/global/popup";
import { sendErrorMessage, sendSuccessMessage, VitalityAction, VitalityInputState, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faCalendar, faMagnifyingGlass, faArrowsUpDown, faArrowRight, faArrowLeft, faArrowRotateLeft, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, useCallback, useMemo } from "react";
import { TagSelection } from "@/components/home/workouts/tag-selection";
import { Tag } from "@/lib/workouts/tags";

export function filterByTags(tagIds: Set<string>, workout: Workout): boolean {
   // Ensure tags within the given workout cover entire provided set of tag id's
   let size: number = 0;

   for (const tagId of workout.tagIds) {
      if (tagIds.has(tagId)) {
         size++;
      }
   }

   return size >= tagIds.size;
}

export function filterByDate(state: VitalityState, workout: Workout): boolean {
   // Apply date filter using min and/or max date and specific method (before, after, between)
   const dateFilter: string = state.workoutsDateFilter.value;
   const minDate: Date = new Date(state.workoutsMinDate.value);
   const maxDate: Date = new Date(state.workoutsMaxDate.value);

   switch (dateFilter) {
   case "Is on or after":
      return isNaN(minDate.getTime()) || workout.date >= minDate;
   case "Is on or before":
      return workout.date <= maxDate;
   default:
      return workout.date >= minDate && workout.date <= maxDate;
   }
}

interface FilterProps {
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout | null>>;
   reset: (_filterReset: boolean) => void;
}

export function filterWorkout(state: VitalityState, workout: Workout): boolean {
   const { dateFiltered, tagsFiltered } = state.workouts.data;

   const tagIds: Set<string> = new Set(
      state.tags.data.selected.map((tag: Tag) => tag.id)
   );

   // Filter by date and/or applied tags, if applicable for either method
   return (!(dateFiltered) || filterByDate(state, workout)) && (!(tagsFiltered) || filterByTags(tagIds, workout));
}

export function getFilteredTagsWorkouts(props: FilterProps): Workout[] | null {
   const { state } = props;

   const tagIds: Set<string> = new Set(
      state.tags.data.selected.map((tag: Tag) => tag.id)
   );

   const filteredWorkouts: Workout[] = [...state.workouts.value].filter((workout: Workout) => {
      return filterByTags(tagIds, workout);
   });

   return filteredWorkouts;
}

export function getFilteredDateWorkouts(props: FilterProps): Workout[] | null {
   const { state, dispatch } = props;

   // Handle invalid inputs
   const errors = {};

   const filter: string = state.workoutsDateFilter.value;
   const minDate: Date = new Date(state.workoutsMinDate.value);
   const maxDate: Date = new Date(state.workoutsMaxDate.value);
   const isRange: boolean = filter === "Is between";

   const validateDate = (date: Date, key: string) => {
      if (isNaN(date.getTime())) {
         errors[key] = ["Date must be non-empty"];
      }
   };

   // For range method, both date inputs are validated
   if (isRange || filter === "Is on or after") {
      validateDate(minDate, "workoutsMinDate");
   }

   if (isRange || filter === "Is on or before") {
      validateDate(maxDate, "workoutsMaxDate");
   }

   // Invalid range errors
   if (isRange && !(Object.keys(errors).length) && minDate > maxDate) {
      errors["workoutsMinDate"] = errors["workoutsMaxDate"] = ["Date range must be valid"];
   }

   if (Object.keys(errors).length > 0) {
      // Display all errors
      dispatch({
         type: "displayErrors",
         value: sendErrorMessage<null>("Error", "Invalid Date filter(s)", null, errors)
      });
   } else {
      // Remove all errors, if any, and apply filter all available workouts
      dispatch({
         type: "displayErrors",
         value: sendSuccessMessage<null>("Success", null)
      });

      const filteredWorkouts: Workout[] = [...state.workouts.value].filter((workout: Workout) => {
         return filterWorkout(state, workout);
      });

      return filteredWorkouts;
   }

   return null;
}

interface DateInputProps extends FilterProps {
   input: VitalityInputState;
}

function DateInput(props: DateInputProps) {
   const { input, state, dispatch } = props;
   const isMinDate = input === state.workoutsMinDate;
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
            <Input input = {input} label = "Date" icon = {faCalendar} dispatch = {dispatch} />
         </div>
      </div>
   );
}

export function FilterByDate(props: FilterProps): JSX.Element {
   const { state, dispatch, reset } = props;
   const dateFilterInput = state.workoutsDateFilter;
   const type = dateFilterInput.value;

   const inputs: { [key: string]: VitalityInputState | undefined } = useMemo(() => {
      return {
         "Is between": undefined,
         "Is on or after": state.workoutsMinDate,
         "Is on or before": state.workoutsMaxDate
      };
   }, [state.workoutsMinDate, state.workoutsMaxDate]);

   const input: VitalityInputState | undefined = useMemo(() => {
      return inputs[type];
   }, [inputs, type]);

   const handleApplyFilterClick = useCallback(() => {
      // Apply date filter
      const filteredWorkouts = getFilteredDateWorkouts(props);

      if (filteredWorkouts !== null) {
         // Update filtered state
         dispatch({
            type: "updateInput",
            value: {
               ...state.workouts,
               data: {
                  ...state.workouts.data,
                  filtered: filteredWorkouts,
                  dateFiltered: true
               }
            }
         });
      }
   }, [props, state.workouts, dispatch]);

   return (
      <PopUp
         className = "max-w-xl"
         cover = {
            <Button
               type = "button"
               className = "bg-gray-300 text-black font-medium w-[10rem] h-[2.9rem] text-sm"
            >
               <FontAwesomeIcon icon = {faCalendar} className = "text-xs" />
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
            <div className = "relative">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {() => reset(true)}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <Select input = {dateFilterInput} label = "Type" icon = {faCalendar} dispatch = {dispatch} />
               {
                  input !== undefined ? (
                     // Min or max
                     <div>
                        <DateInput {...props} input = {input} />
                     </div>
                  ) : (
                     // Range (Min and Max Date Input's)
                     <div className = "my-2">
                        <Input input = {state.workoutsMinDate} label = "Min" icon = {faCalendar} dispatch = {dispatch} />
                        <FontAwesomeIcon
                           icon = {faArrowsUpDown}
                           className = "text-lg text-primary my-2"
                        />
                        <Input input = {state.workoutsMaxDate} label = "Max" icon = {faCalendar} dispatch = {dispatch} />
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

export function FilterByTags(props: FilterProps): JSX.Element {
   const { state, dispatch, reset } = props;

   const handleInitializeFilteredTags = useCallback(() => {
      // Selected tags are applied from prior filter form selection
      dispatch({
         type: "updateInput",
         value: {
            ...state.tags,
            data: {
               ...state.tags.data,
               selected: state.tags.data.filteredSelected
            }
         }
      });
   }, [state.tags, dispatch]);

   const handleApplyFilterClick = useCallback(() => {
      // Apply tag filter
      const filteredWorkouts = getFilteredTagsWorkouts(props);

      if (filteredWorkouts !== null) {
         // Update filtered state
         dispatch({
            type: "updateInput",
            value: {
               ...state.workouts,
               data: {
                  ...state.workouts.data,
                  filtered: filteredWorkouts,
                  tagsFiltered: true
               }
            }
         });

         // Cache filtered tags selection
         dispatch({
            type: "updateInput",
            value: {
               ...state.tags,
               data: {
                  ...state.tags.data,
                  filteredSelected: state.tags.data.selected
               }
            }
         });
      }
   }, [dispatch, props, state.tags, state.workouts]);

   return (
      <PopUp
         className = "max-w-xl"
         cover = {
            <Button
               type = "button"
               className = "bg-gray-300 text-black font-medium w-[10rem] h-[2.9rem] text-sm"
               onClick = {handleInitializeFilteredTags}
            >
               <FontAwesomeIcon icon = {faTag} className = "text-xs" />
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
            <div className = "relative">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {() => reset(true)}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <div className = "w-full mx-auto my-2">
                  <TagSelection input = {state.tags} label = "Tags " dispatch = {dispatch} state = {state} />
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