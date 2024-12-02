import clsx from "clsx";
import Button from "@/components/global/button";
import Select from "@/components/global/select";
import { VitalityProps } from "@/lib/global/state";
import { Workout } from "@/lib/home/workouts/workouts";
import { faCircleChevronLeft, faCircleChevronRight, faFileLines,   faTabletScreenButton } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useCallback } from "react";

interface PaginationProps extends VitalityProps {
   workouts: Workout[];
}

export default function Pagination(props: PaginationProps): JSX.Element {
   const { workouts, globalState, globalDispatch } = props;

   // Total workout pages and index
   const pages: number = Math.ceil(workouts.length / globalState.paging.value);
   const page: number = globalState.page.value;

   const pagination: number[] = Array.from(
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
      }, [
         globalDispatch,
         globalState.page
      ]);

   const handleLeftClick = () => {
      handlePageClick(Math.max(0, page - 1));
   };

   const handleRightClick = () => {
      handlePageClick(Math.min(pages - 1, page + 1));
   };

   const handleEntriesOnChange = useCallback(
      (event: ChangeEvent<HTMLSelectElement>) => {
         globalDispatch({
            type: "updateStates",
            value: {
               paging: {
                  ...globalState.paging,
                  value: Number.parseInt(event.target.value)
               },
               page: {
                  ...globalState.page,
                  // When visible entries per page are changed, reset page index
                  value: 0
               }
            }
         });

         document.getElementById("workoutsView")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
         window.localStorage.setItem("paging", event.target.value);
      }, [
         globalDispatch,
         globalState.paging,
         globalState.page
      ]);

   return (
      workouts.length > 0 && (
         <div className = "my-6 max-w-sm justify-self-end text-lg">
            <div className = "relative mx-4 flex max-w-xs flex-row items-center justify-center">
               <FontAwesomeIcon
                  icon = { faCircleChevronLeft }
                  className = "cursor-pointer text-xl text-primary"
                  onClick = { handleLeftClick }
               />
               {
                  low > 0 && (
                     <div className = "ml-4 flex flex-row items-center justify-center gap-4">
                        <Button
                           key = "min"
                           onClick = { () => handlePageClick(0) }
                        >
                           1
                        </Button>
                        <Button key = "low">...</Button>
                     </div>
                  )
               }
               {
                  pagination.slice(low, high).map((index) => {
                     const isSelected: boolean = index === page + 1;

                     return (
                        <Button
                           key = { index }
                           onClick = { () => handlePageClick(index - 1) }
                           className = {
                              clsx("h-[2.2rem] w-12 rounded-lg", {
                                 "font-bold text-primary border-2 border-primary bg-blue-100": isSelected,
                                 "ml-2": isSelected && index === 1,
                                 "mr-2": isSelected && index === pages
                              })
                           }
                        >
                           { index }
                        </Button>
                     );
                  })
               }
               {
                  high < pages && (
                     <div className = "mr-4 flex flex-row items-center justify-center gap-4">
                        <Button key = "higher">...</Button>
                        <Button
                           key = "min"
                           onClick = { () => handlePageClick(pages - 1) }
                        >
                           { pages }
                        </Button>
                     </div>
                  )
               }
               <FontAwesomeIcon
                  icon = { faCircleChevronRight }
                  className = "cursor-pointer text-xl text-primary"
                  onClick = { handleRightClick }
               />
            </div>
            <div className = "relative">
               <Select
                  id = "page"
                  type = "select"
                  label = "Page"
                  icon = { faFileLines }
                  input = { globalState.page }
                  value = { page + 1 }
                  values = { pagination }
                  dispatch = { globalDispatch }
                  className = "mt-4 max-h-20 min-w-40"
                  onChange = { (event) => handlePageClick(event.target.value - 1) }
               />
            </div>
            <div className = "relative">
               <Select
                  id = "paging"
                  type = "select"
                  label = "Entries"
                  icon = { faTabletScreenButton }
                  input = { globalState.paging }
                  values = { [5, 10, 25, 50, 100, 500, 1000] }
                  dispatch = { globalDispatch }
                  className = "mt-2 max-h-20 min-w-40"
                  onChange = { (event) => handleEntriesOnChange(event) }
               />
            </div>
         </div>
      )
   );
}