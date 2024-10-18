import clsx from "clsx";
import Image from "next/image";
import WorkoutForm from "./form";
import Loading from "@/components/global/loading";
import { Dispatch } from "react";
import { VitalityAction, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { getWorkoutDate } from "@/lib/workouts/shared";

interface WorkoutCardProps extends WorkoutCardsProps {
   workout: Workout;
}

function WorkoutCard(props: WorkoutCardProps): JSX.Element {
   const { workout } = props;

   return (
      <WorkoutForm
         {...props}
         cover = {
            <div className = "cursor-pointer flex flex-col justify-center items-center gap-2 w-[17rem] rounded-2xl overflow-hidden shadow-lg bg-white hover:scale-105 transition duration-300 ease-in-out">
               <div className = "w-full h-[12rem] rounded-2xl rounded-b-none bg-primary">
                  {
                     workout.image ? (
                        <Image
                           width = {1000}
                           height = {1000}
                           quality = {100}
                           src = {workout.image}
                           alt = "workout-image"
                           className = {clsx("w-full h-full object-cover object-center transition duration-300 ease-in-out")}
                        />
                     ) : (
                        null
                     )
                  }
               </div>
               <div className = "flex flex-col justify-start items-center gap-2 w-full h-[10rem] overflow-hidden text-center">
                  <h2 className = "font-bold text-xl mb-2 px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[90%]">{workout.title}</h2>
                  <p className = "text-gray-600 text-sm">{getWorkoutDate(workout.date)}</p>
               </div>
            </div>
         }
      />
   );
};

interface WorkoutCardsProps {
   workouts: Workout[];
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout | null>>;
   reset: (_filterReset: boolean) => void;
}

export default function WorkoutCards(props: WorkoutCardsProps): JSX.Element {
   const { workouts, state } = props;
   const fetched: boolean = state.workouts.data.fetched;

   return (
      <div className = "relative w-full">
         {
            workouts.length > 0 ? (
               <div className = "w-10/12 mx-auto flex flex-wrap justify-center gap-6 mt-6">
                  {workouts.map((workout: Workout) => (
                     <WorkoutCard {...props} workout = {workout} key = {workout.id} />
                  ))}
               </div>
            ) : (
               <div className = "w-screen h-[15rem] mx-auto text-center flex justify-center items-center">
                  { fetched ? <h1 className = "font-bold text-xl">No available workouts</h1> : <Loading /> }
               </div>
            )
         }
      </div>
   );
}