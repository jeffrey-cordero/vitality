import clsx from "clsx";
import Button from "@/components/global/button";
import Select from "@/components/global/select";
import { VitalityProps } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import {
   faCircleChevronLeft,
   faCircleChevronRight,
   faFileLines,
   faTabletScreenButton
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useCallback } from "react";

interface PaginationProps extends VitalityProps {
  workouts: Workout[];
}

export default function Pagination(props: PaginationProps): JSX.Element {
   const { globalState, globalDispatch, workouts } = props;

   // Hold total table/cards pages and current page index
   const pages: number = Math.ceil(workouts.length / globalState.paging.value);
   const page: number = globalState.page.value;

   const array: number[] = Array.from(
      { length: pages },
      (_, index) => index + 1,
   );
   const low: number = Math.max(0, page === pages - 1 ? page - 2 : page - 1);
   const high: number = Math.min(pages, page === 0 ? page + 3 : page + 2);

   const handlePageClick = useCallback(
      (page: number) => {
         globalDispatch({
            type: "updateState",
            value: {
               id: "page",
               input: {
                  ...globalState.page,
                  value: page
               }
            }
         });
      },
      [globalDispatch, globalState.page],
   );

   const handleLeftClick = () => {
      handlePageClick(Math.max(0, page - 1));
   };

   const handleRightClick = () => {
      handlePageClick(Math.min(pages - 1, page + 1));
   };

   const handleEntriesOnChange = useCallback(
      (event: ChangeEvent<HTMLSelectElement>) => {
      // When total visible entries are changed, ensure to reset page index to first page
         globalDispatch({
            type: "updateStates",
            value: {
               paging: {
                  ...globalState.paging,
                  value: Number.parseInt(event.target.value)
               },
               page: {
                  ...globalState.page,
                  value: 0
               }
            }
         });

         document
            .getElementById("workoutsView")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      [globalDispatch, globalState.paging, globalState.page],
   );

   return (
      workouts.length > 0 && (
         <div className = "max-w-sm mt-6 justify-self-end text-lg">
            <div className = "relative flex flex-row justify-center items-center mb-2">
               <FontAwesomeIcon
                  icon = {faCircleChevronLeft}
                  className = "cursor-pointer text-primary text-xl mr-2"
                  onClick = {handleLeftClick}
               />
               {low > 0 && (
                  <div className = "flex flex-row justify-center items-center">
                     <Button
                        key = "min"
                        onClick = {() => handlePageClick(0)}>
                1
                     </Button>
                     <Button key = "low">...</Button>
                  </div>
               )}
               {array.slice(low, high).map((index) => (
                  <Button
                     key = {index}
                     onClick = {() => handlePageClick(index - 1)}
                     className = {clsx("rounded-lg px-2 py-1", {
                        "font-bold text-primary border-2 border-primary bg-blue-100":
                  index === page + 1
                     })}>
                     {index}
                  </Button>
               ))}
               {high < pages && (
                  <div className = "flex flex-row justify-center items-center">
                     <Button key = "higher">...</Button>
                     <Button
                        key = "min"
                        onClick = {() => handlePageClick(pages - 1)}>
                        {pages}
                     </Button>
                  </div>
               )}
               <FontAwesomeIcon
                  icon = {faCircleChevronRight}
                  className = "cursor-pointer text-primary text-xl ml-2"
                  onClick = {handleRightClick}
               />
            </div>
            <div className = "relative">
               <Select
                  id = "page"
                  type = "select"
                  label = "Page"
                  icon = {faFileLines}
                  input = {globalState.page}
                  value = {page + 1}
                  values = {array}
                  dispatch = {globalDispatch}
                  className = "min-w-[10rem] max-h-[5rem] mt-4"
                  onChange = {(event) => {
                     handlePageClick(event.target.value - 1);
                  }}
               />
            </div>
            <div className = "relative">
               <Select
                  id = "paging"
                  type = "select"
                  label = "Entries"
                  icon = {faTabletScreenButton}
                  input = {globalState.paging}
                  values = {[5, 10, 25, 50, 100, 500, 1000]}
                  dispatch = {globalDispatch}
                  className = "min-w-[10rem] max-h-[5rem] mt-2"
                  onChange = {(event) => handleEntriesOnChange(event)}
               />
            </div>
         </div>
      )
   );
}
