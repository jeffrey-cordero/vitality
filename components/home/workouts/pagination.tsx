import clsx from "clsx";
import Button from "@/components/global/button";
import Select from "@/components/global/select";
import { VitalityProps } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faCircleChevronLeft, faCircleChevronRight, faTabletScreenButton } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useCallback } from "react";

interface PaginationProps extends VitalityProps {
   workouts: Workout[];
}

export default function Pagination(props: PaginationProps): JSX.Element {
   const { globalState, globalDispatch, workouts } = props;

   // Hold total table/cards pages and current page index
   const fetched: boolean = globalState.workouts.data.fetched;
   const pages: number = Math.ceil(workouts.length / globalState.paging.value);
   const page: number = globalState.paging.data.page;

   const handlePageClick = useCallback((page: number) => {
      globalDispatch({
         type: "updateState",
         value: {
            id: "paging",
            input: {
               ...globalState.paging,
               data: {
                  ...globalState.paging.data,
                  page: page
               }
            }
         }
      });

      document.getElementById("workoutsView")?.scrollIntoView({ behavior: "smooth", block: "start" });
   }, [globalDispatch, globalState.paging]);

   if (fetched && page >= pages) {
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
      globalDispatch({
         type: "updateState",
         value: {
            id: "paging",
            input: {
               ...globalState.paging,
               value: event.target.value,
               error: null,
               data: {
                  ...globalState.paging.data,
                  page: 0
               }
            }
         }
      });

      document.getElementById("workoutsView")?.scrollIntoView({ behavior: "smooth", block: "start" });
   }, [globalDispatch, globalState.paging]);

   return (
      workouts.length > 0 && (
         <div className = "mt-6 justify-self-end text-lg">
            <div className = "flex flex-row justify-center items-center mb-2">
               <FontAwesomeIcon
                  icon = {faCircleChevronLeft}
                  className = "cursor-pointer text-primary text-xl mr-2"
                  onClick = {handleLeftClick} />
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
               <FontAwesomeIcon
                  icon = {faCircleChevronRight}
                  className = "cursor-pointer text-primary text-xl ml-2"
                  onClick = {handleRightClick} />
            </div>
            <div>
               <Select
                  id = "paging"
                  type = "select"
                  label = "Entries"
                  icon = {faTabletScreenButton}
                  input = {globalState.paging}
                  values = {[5, 10, 25, 50, 100, 500, 1000]}
                  dispatch = {globalDispatch}
                  className = "min-w-[10rem] max-h-[5rem] mt-4"
                  onChange = {(event) => handleEntriesOnChange(event)}
               />
            </div>
         </div>
      )
   );
}