"use client";
import { faAnglesLeft, faAnglesRight, faFileLines, faTabletScreenButton } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ChangeEvent, useCallback } from "react";

import Button from "@/components/global/button";
import Select from "@/components/global/select";
import { VitalityProps } from "@/lib/global/reducer";
import { Workout } from "@/lib/home/workouts/workouts";

interface PaginationProps extends VitalityProps {
   workouts: Workout[];
}

export default function Pagination(props: PaginationProps): JSX.Element {
   const { workouts, globalState, globalDispatch } = props;
   const pages: number = Math.ceil(workouts.length / globalState.paging.value);
   const page: number = globalState.page.value;

   const low: number = Math.max(0, page === pages - 1 ? page - 2 : page - 1);
   const high: number = Math.min(pages, page === 0 ? page + 3 : page + 2);
   const paginationArray: number[] = Array.from({ length: pages }, (_, index) => index + 1);

   const updatePage = useCallback((page: number) => {
      globalDispatch({
         type: "updateState",
         value: {
            id: "page",
            value: {
               value: page
            }
         }
      });

      window.localStorage.setItem("page", String(page));
   }, [globalDispatch]);

   const leftClick = () => {
      updatePage(Math.max(0, page - 1));
   };

   const rightClick = () => {
      updatePage(Math.min(pages - 1, page + 1));
   };

   const updateEntriesPerPage = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
      globalDispatch({
         type: "updateStates",
         value: {
            paging: {
               value: Number.parseInt(event.target.value)
            },
            // Reset to the initial page when entries are changed
            page: {
               value: 0
            }
         }
      });

      window.localStorage.setItem("paging", String(event.target.value));
      document.getElementById("workoutsView")?.scrollIntoView({ behavior: "smooth", block: "start" });
   }, [globalDispatch]);

   return (
      workouts.length > 0 && (
         <div className = "mx-auto w-full max-w-sm items-center justify-center text-center">
            <div className = "relative mx-auto flex max-w-xs flex-row items-center justify-center">
               <FontAwesomeIcon
                  tabIndex = { 0 }
                  icon = { faAnglesLeft }
                  onKeyDown = { (event: React.KeyboardEvent) => event.key === "Enter" && leftClick() }
                  className = "cursor-pointer text-xl text-primary hover:text-primary/60 focus:border-transparent focus:text-primary/60 focus:outline-0"
                  onClick = { leftClick }
                  aria-hidden = { false }
               />
               {
                  low > 0 && (
                     <div className = "hidden flex-row items-center justify-center xsm:flex">
                        <Button
                           tabIndex = { 0 }
                           key = "min"
                           onClick = { () => updatePage(0) }
                           className = "h-10 w-12 rounded-lg text-lg focus:text-primary focus:ring-transparent"
                        >
                           1
                        </Button>
                        <div key = "low">...</div>
                     </div>
                  )
               }
               {
                  paginationArray.slice(low, high).map((index) => {
                     const isSelected: boolean = index === page + 1;

                     return (
                        <Button
                           tabIndex = { 0 }
                           key = { index }
                           onClick = { () => updatePage(index - 1) }
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
                  high < pages && (
                     <div className = "hidden flex-row items-center justify-center xsm:flex">
                        <div key = "higher">...</div>
                        <Button
                           tabIndex = { 0 }
                           key = "min"
                           onClick = { () => updatePage(pages - 1) }
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
                  onKeyDown = { (event: React.KeyboardEvent) => event.key === "Enter" && rightClick() }
                  className = "cursor-pointer text-xl text-primary hover:text-primary/60 focus:border-transparent focus:text-primary/60 focus:outline-0"
                  onClick = { rightClick }
                  aria-hidden = { false }
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
                     values = { paginationArray }
                     dispatch = { globalDispatch }
                     className = "mx-auto size-full"
                     onChange = { (event) => updatePage(event.target.value - 1) }
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
                     onChange = { (event) => updateEntriesPerPage(event) }
                  />
               </div>
            </div>
         </div>
      )
   );
}