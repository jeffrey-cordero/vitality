import clsx from "clsx";
import Button from "@/components/global/button";
import Select from "@/components/global/select";
import { VitalityAction, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faCircleChevronLeft, faCircleChevronRight, faTabletScreenButton } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, Dispatch, useCallback } from "react";

interface PaginationProps {
   workouts: Workout[];
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout>>;
}

export default function Pagination(props: PaginationProps): JSX.Element {
   const { state, dispatch, workouts } = props;

   // Hold total table/cards pages and current page index
   const pages: number = Math.ceil(workouts.length / state.workoutsPaging.value);
   const page: number = state.workoutsPaging.data.page;

   const handlePageClick = useCallback((page: number) => {
      dispatch({
         type: "updateState",
         value: {
            ...state.workoutsPaging,
            data: {
               ...state.workoutsPaging.data,
               page: page
            }
         }
      });
   }, [dispatch, state.workoutsPaging]);

   if (page >= pages) {
      // Ensure current page index is within range, especially when deleting workouts
      handlePageClick(Math.max(0, pages - 1));
   }

   const handleLeftClick = () => {
      handlePageClick(Math.max(0, page - 1));
   };

   const handleRightClick = () => {
      handlePageClick(Math.min(pages - 1, page + 1));
   };

   const handleEntriesOnChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
      // When total visible entries are changed, ensure to reset page index to first page
      dispatch({
         type: "updateState",
         value: {
            ...state.workoutsPaging,
            value: event.target.value,
            error: null,
            data: {
               ...state.workoutsPaging.data,
               page: 0
            }
         }
      });
   }, [dispatch, state.workoutsPaging]);

   return (
      <div className = "mt-6 text-lg">
         <div className = "flex flex-row justify-center items-center mb-2">
            <FontAwesomeIcon icon = {faCircleChevronLeft} className = "cursor-pointer text-primary text-xl mr-2" onClick = {handleLeftClick} />
            {Array.from({ length: pages }, (_, index) => (
               <Button
                  key = {index}
                  onClick = {() => handlePageClick(index)}
                  className = {clsx("rounded-lg px-2 py-1", {
                     "font-bold text-primary border-2 border-primary bg-blue-100": index === page
                  })}
               >
                  {index + 1}
               </Button>
            ))}
            <FontAwesomeIcon icon = {faCircleChevronRight} className = "cursor-pointer text-primary text-xl ml-2" onClick = {handleRightClick} />
         </div>
         <div>
            <Select label = "Entries" icon = {faTabletScreenButton} input = {state.workoutsPaging} state = {state} dispatch = {dispatch} className = "min-w-[10rem] max-h-[5rem] mt-4"
               onChange = {(event) => handleEntriesOnChange(event)}
            />
         </div>
      </div>
   );
}