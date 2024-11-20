import Button from "@/components/global/button";
import clsx from "clsx";
import Table from "@/components/home/workouts/table";
import Cards from "@/components/home/workouts/cards";
import Loading from "@/components/global/loading";
import { VitalityProps } from "@/lib/global/state";
import { Workout } from "@/lib/home/workouts/workouts";
import {
   faPersonRunning,
   faPhotoFilm,
   faTable
} from "@fortawesome/free-solid-svg-icons";
import { Dispatch } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ViewProps extends VitalityProps {
  view: "table" | "cards" | "";
  setView: Dispatch<"table" | "cards">;
  workouts: Workout[];
}

export default function View(props: ViewProps): JSX.Element {
   const { view, setView, workouts, globalState, globalDispatch } = props;
   const fetched: boolean = globalState.workouts.data.fetched;

   return (
      <div className = "relative w-full mx-auto flex flex-col justify-center items-center">
         <div className = "flex justify-start items-center text-left gap-4 text-md">
            <Button
               icon = {faTable}
               onClick = {() => {
                  setView("table");
                  window.localStorage.setItem("view", "table");
               }}
               className = {clsx("transition duration-300 ease-in-out", {
                  "scale-105 border-b-4 border-b-primary rounded-none": view === "table"
               })}>
               Table
            </Button>
            <Button
               icon = {faPhotoFilm}
               onClick = {() => {
                  setView("cards");
                  window.localStorage.setItem("view", "cards");
               }}
               className = {clsx("transition duration-300 ease-in-out", {
                  "scale-105  border-b-4 border-b-primary rounded-none": view === "cards"
               })}>
               Cards
            </Button>
         </div>
         <div
            id = "workoutsView"
            className = "w-11/12 xl:w-9/12 flex-grow flex flex-col justify-start items-center">
            {workouts.length === 0 ? (
               <div className = "w-full h-[40vh] mx-auto text-center flex justify-center items-center">
                  {fetched ? (
                     <div className = "flex flex-col gap-2">
                        <FontAwesomeIcon
                           icon = {faPersonRunning}
                           className = "text-primary text-5xl"
                        />
                        <h1 className = "font-bold text-lg">No available workouts</h1>
                     </div>
                  ) : (
                     <Loading />
                  )}
               </div>
            ) : view === "table" ? (
               <Table
                  workouts = {workouts}
                  globalState = {globalState}
                  globalDispatch = {globalDispatch}
               />
            ) : (
               view === "cards" && (
                  <Cards
                     workouts = {workouts}
                     globalState = {globalState}
                     globalDispatch = {globalDispatch}
                  />
               )
            )}
         </div>
      </div>
   );
}