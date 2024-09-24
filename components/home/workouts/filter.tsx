import Button from "@/components/global/button";
import Input from "@/components/global/input";
import Select from "@/components/global/select";
import { PopUp } from "@/components/global/popup";
import { VitalityAction, VitalityInputState, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faCalendar, faArrowsUpDown, faMagnifyingGlass, faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, useMemo } from "react";
import clsx from "clsx";

interface FilterByDateProps {
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout>>;
}

interface DateInputProps extends FilterByDateProps {
   input: VitalityInputState;
}

function DateInput(props: DateInputProps) {
   const { input, state, dispatch } = props;
   const isMinDate = input === state.inputs.workoutsMinDate
   const icon = isMinDate ? faArrowDown : faArrowUp;

   return (
      <div className={clsx("flex flex-col justify-center items-center", {
         "flex-col-reverse": !(isMinDate)
      })}>
         {/* // Min -> ... or ... <- Max */}
         <div className="w-full mx-auto">
            <Input input={input} label="Date" icon={faCalendar} dispatch={dispatch} />
         </div>
         <div className={clsx("flex flex-col justify-center items-center text-primary", {
    
         })}>
            <FontAwesomeIcon
               icon={icon}
               className="text-lg text-primary my-2"
            />
            <p>...</p>
         </div>
      </div>
   )
}

export function FilterByDate(props: FilterByDateProps): JSX.Element {
   const { state, dispatch } = props;
   const dateTypeInput = state.inputs.workoutsDateFilter;
   const type = dateTypeInput.value;

   const inputs: { [key: string]: VitalityInputState | undefined } = useMemo(() => {
      return {
         "Is between (inclusive)": undefined,
         "Is on or after": state.inputs.workoutsMinDate,
         "Is on or before": state.inputs.workoutsMaxDate
      };
   }, [state.inputs.workoutsMinDate, state.inputs.workoutsMaxDate]);

   const input: VitalityInputState | undefined = useMemo(() => {
      return inputs[type];
   }, [type]);


   return (
      <PopUp
         className="max-w-xl"
         cover={
            <Button
               type="button"
               className="bg-gray-300 text-black font-medium w-[10rem] h-[2.6rem] text-sm"
            >
               <FontAwesomeIcon icon={faCalendar} className="text-xs" />
               Filter by Date
            </Button>
         }
      >
         <div className="flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon={faCalendar}
               className="text-3xl text-primary mt-1"
            />
            <h1 className="text-2xl font-bold text-black mb-2">
               Filter by Date
            </h1>
            <div>
               <Select input={dateTypeInput} label="Type" icon={faCalendar} dispatch={dispatch} />
               {
                  input !== undefined ? (
                     // Min or max
                     <div className="my-6">
                        <DateInput {...props} input={input} />
                     </div>
                  ) : (
                     // Range (Min and Max inputs)
                     <div className="my-6">
                        <Input input={state.inputs.workoutsMinDate} label="Min" icon={faCalendar} dispatch={dispatch} />
                        <FontAwesomeIcon
                           icon={faArrowsUpDown}
                           className="text-lg text-primary my-2"
                        />
                        <Input input={state.inputs.workoutsMaxDate} label="Max" icon={faCalendar} dispatch={dispatch} />
                     </div>
                  )
               }
               <Button
                  type="button"
                  className="bg-primary text-white font-bold w-full h-[2.6rem] text-sm"
                  icon={faMagnifyingGlass}
               >
                  Apply
               </Button>
            </div>
         </div>
      </PopUp>
   );
}