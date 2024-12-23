"use client";
import { faAnglesLeft, faAnglesRight, faFileLines, faTabletScreenButton } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ChangeEvent, useCallback } from "react";

import Button from "@/components/global/button";
import Select from "@/components/global/select";
import { VitalityProps } from "@/lib/global/state";
import { Workout } from "@/lib/home/workouts/workouts";

interface PaginationProps extends VitalityProps {
   workouts: Workout[];
}

export default function Pagination(props: PaginationProps): JSX.Element {
   const { workouts, globalState, globalDispatch } = props;
   // Total workout pages and current page index
   const pages: number = Math.ceil(workouts.length / globalState.paging.value);
   const page: number = globalState.page.value;

   const pagination: number[] = Array.from({ length: pages }, (_, index) => index + 1);
   const lowIndex: number = Math.max(0, page === pages - 1 ? page - 2 : page - 1);
   const highIndex: number = Math.min(pages, page === 0 ? page + 3 : page + 2);

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

         window.localStorage.setItem("page", String(page));
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

   const handleEntriesOnChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
      globalDispatch({
         type: "updateStates",
         value: {
            paging: {
               ...globalState.paging,
               value: Number.parseInt(event.target.value)
            },
            page: {
               ...globalState.page,
               // Reset to initial page index
               value: 0
            }
         }
      });

      window.localStorage.setItem("paging", String(event.target.value));
      document.getElementById("workoutsView")?.scrollIntoView({ behavior: "smooth", block: "start" });
   }, [
      globalDispatch,
      globalState.paging,
      globalState.page
   ]);

   return (
      workouts.length > 0 && (
         <div className = "mx-auto w-full max-w-sm items-center justify-center text-center">
            <div className = "relative mx-auto flex max-w-xs flex-row items-center justify-center">
               <FontAwesomeIcon
                  tabIndex = { 0 }
                  icon = { faAnglesLeft }
                  onKeyDown = { (event: React.KeyboardEvent) => event.key === "Enter" && handleLeftClick() }
                  className = "cursor-pointer text-xl text-primary hover:text-primary/60 focus:border-transparent focus:text-primary/60 focus:outline-0"
                  onClick = { handleLeftClick }
               />
               {
                  lowIndex > 0 && (
                     <div className = "hidden flex-row items-center justify-center xsm:flex">
                        <Button
                           tabIndex = { 0 }
                           key = "min"
                           onClick = { () => handlePageClick(0) }
                           className = "h-10 w-12 rounded-lg text-lg focus:text-primary focus:ring-transparent"
                        >
                           1
                        </Button>
                        <div key = "low">...</div>
                     </div>
                  )
               }
               {
                  pagination.slice(lowIndex, highIndex).map((index) => {
                     const isSelected: boolean = index === page + 1;

                     return (
                        <Button
                           tabIndex = { 0 }
                           key = { index }
                           onClick = { () => handlePageClick(index - 1) }
                           className = {
                              clsx("h-10 w-12 rounded-lg text-lg focus:text-primary focus:ring-transparent", {
                                 "font-bold text-primary border-primary border-2 bg-sky-100 focus:bg-sky-200": isSelected,
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
                  highIndex < pages && (
                     <div className = "hidden flex-row items-center justify-center xsm:flex">
                        <div key = "higher">...</div>
                        <Button
                           tabIndex = { 0 }
                           key = "min"
                           onClick = { () => handlePageClick(pages - 1) }
                           className = "h-10 w-12 rounded-lg text-lg focus:text-primary focus:ring-transparent"
                        >
                           { pages }
                        </Button>
                     </div>
                  )
               }
               <FontAwesomeIcon
                  tabIndex = { 0 }
                  icon = { faAnglesRight }
                  onKeyDown = { (event: React.KeyboardEvent) => event.key === "Enter" && handleRightClick() }
                  className = "cursor-pointer text-xl text-primary hover:text-primary/60 focus:border-transparent focus:text-primary/60 focus:outline-0"
                  onClick = { handleRightClick }
               />
            </div>
            <div className = "mt-4 flex flex-col items-center justify-center xsm:flex-row">
               <div className = "mx-auto h-16 w-44">
                  <Select
                     id = "page"
                     type = "select"
                     label = "Page"
                     icon = { faFileLines }
                     input = { globalState.page }
                     value = { page + 1 }
                     values = { pagination }
                     dispatch = { globalDispatch }
                     className = "mx-auto size-full"
                     onChange = { (event) => handlePageClick(event.target.value - 1) }
                  />
               </div>
               <div className = "mx-auto h-16 w-44">
                  <Select
                     id = "paging"
                     type = "select"
                     label = "Entries"
                     icon = { faTabletScreenButton }
                     input = { globalState.paging }
                     values = { [5, 10, 25, 50, 100, 500, 1000] }
                     dispatch = { globalDispatch }
                     className = "mx-auto size-full"
                     onChange = { (event) => handleEntriesOnChange(event) }
                  />
               </div>
            </div>
         </div>
      )
   );
}