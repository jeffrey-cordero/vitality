import Button from "@/components/global/button";
import Input from "@/components/global/input";
import Select from "@/components/global/select";
import { PopUp } from "@/components/global/popup";
import { sendErrorMessage, sendSuccessMessage, VitalityAction, VitalityInputState, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faCalendar, faMagnifyingGlass, faArrowsUpDown, faArrowRight, faArrowLeft, faArrowRotateLeft, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, useMemo } from "react";
import { TagSelection } from "@/components/home/workouts/tag-selection";

export function filterByTags(state: VitalityState, workout: Workout): boolean {
   // No filtering required
   if (!(state.inputs.workouts.data.tagsFilter)) {
      return true;
   }

   // TODO

   return true;
}

export function filterByDate(state: VitalityState, workout: Workout): boolean {
   // No filtering required
   if (!(state.inputs.workouts.data.dateFilter)) {
      return true;
   }

   // Apply date filter
   const dateFilter: string = state.inputs.workoutsDateFilter.value;
   const minDate: Date = new Date(state.inputs.workoutsMinDate.value);
   const maxDate: Date = new Date(state.inputs.workoutsMaxDate.value);

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
   reset: () => void;
}

export function applyDateFilters(props: FilterProps): Workout[] | null {
   const { state, dispatch } = props;

   const filter: string = state.inputs.workoutsDateFilter.value;
   const minDate: Date = new Date(state.inputs.workoutsMinDate.value);
   const maxDate: Date = new Date(state.inputs.workoutsMaxDate.value);
   const isRange: boolean = filter === "Is between";

   // Handle invalid inputs
   const errors = {};

   const validateDate = (date: Date, key: string) => {
      if (isNaN(date.getTime())) {
         errors[key] = ["Date must be non-empty"];
      }
   };

   // Invalid date errors, for the current applied filter
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
         type: "updateStatus",
         value: sendErrorMessage<null>("Error", "Invalid Date filter(s)", null, errors)
      });
   } else {
      // Remove all errors, if any, and apply filter
      dispatch({
         type: "updateStatus",
         value: sendSuccessMessage<null>("Success", null)
      });

      const filteredWorkouts: Workout[] = [...state.inputs.workouts.value].filter((workout: Workout) => {
         return filterByDate(state, workout);
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
   const isMinDate = input === state.inputs.workoutsMinDate;
   const icon = isMinDate ? faArrowRight : faArrowLeft;

   return (
      <div className = "flex flex-col justify-center items-center my-6">
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
   const dateTypeInput = state.inputs.workoutsDateFilter;
   const type = dateTypeInput.value;

   const inputs: { [key: string]: VitalityInputState | undefined } = useMemo(() => {
      return {
         "Is between": undefined,
         "Is on or after": state.inputs.workoutsMinDate,
         "Is on or before": state.inputs.workoutsMaxDate
      };
   }, [state.inputs.workoutsMinDate, state.inputs.workoutsMaxDate]);

   const input: VitalityInputState | undefined = useMemo(() => {
      return inputs[type];
   }, [inputs, type]);

   return (
      <PopUp
         className = "max-w-xl"
         cover = {
            <Button
               type = "button"
               className = "bg-gray-300 text-black font-medium w-[10rem] h-[2.6rem] text-sm"
            >
               <FontAwesomeIcon icon = {faCalendar} className = "text-xs" />
               Filter by Date
            </Button>
         }
      >
         <div className = "flex flex-col justify-center align-center text-center gap-2 py-2">
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
                  onClick = {() => reset()}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <Select input = {dateTypeInput} label = "Type" icon = {faCalendar} dispatch = {dispatch} />
               {
                  input !== undefined ? (
                     // Min or max
                     <div className = "mt-6">
                        <DateInput {...props} input = {input} />
                     </div>
                  ) : (
                     // Range (Min and Max inputs)
                     <div className = "my-6">
                        <Input input = {state.inputs.workoutsMinDate} label = "Min" icon = {faCalendar} dispatch = {dispatch} />
                        <FontAwesomeIcon
                           icon = {faArrowsUpDown}
                           className = "text-lg text-primary my-2"
                        />
                        <Input input = {state.inputs.workoutsMaxDate} label = "Max" icon = {faCalendar} dispatch = {dispatch} />
                     </div>
                  )
               }
               <Button
                  type = "button"
                  className = "bg-primary text-white font-bold w-full h-[2.6rem] text-sm"
                  icon = {faMagnifyingGlass}
                  onClick = {() => {
                     // Apply date filter
                     const filteredWorkouts = applyDateFilters(props);

                     if (filteredWorkouts !== null) {
                        // Update filtered state
                        dispatch({
                           type: "updateInput",
                           value: {
                              ...state.inputs.workouts,
                              data: {
                                 ...state.inputs.workouts.data,
                                 filtered: filteredWorkouts,
                                 dateFilter: true
                              }
                           }
                        });
                     }
                  }}
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
   
   return (
      <PopUp
         className = "max-w-xl"
         cover = {
            <Button
               type = "button"
               className = "bg-gray-300 text-black font-medium w-[10rem] h-[2.6rem] text-sm"
            >
               <FontAwesomeIcon icon = {faTag} className = "text-xs" />
               Filter by Tags
            </Button>
         }
      >
         <div className = "flex flex-col justify-center align-center text-center gap-2 py-2">
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
                  onClick = {() => reset()}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <div className="w-full mx-auto my-2">
               <TagSelection input = {state.inputs.tags} label = "Tags " dispatch = {dispatch} state = {state} />
               </div>
            </div>
         </div>
      </PopUp>
   );
}