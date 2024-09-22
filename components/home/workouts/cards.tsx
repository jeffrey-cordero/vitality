import clsx from "clsx";
import Image from "next/image";
import WorkoutForm from "./form";
import { Dispatch } from "react";
import { VitalityAction, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";

interface WorkoutCardProps extends WorkoutCardsProps {
   workout: Workout;
}

function WorkoutCard(props: WorkoutCardProps): JSX.Element {
   const { workout } = props;

   return (
      <WorkoutForm
         {...props}
         cover = {
            <div className = "cursor-pointer flex flex-col justify-center items-center gap-2 w-[18rem] rounded-2xl overflow-hidden shadow-lg bg-white hover:scale-105 transition duration-300 ease-in-out">
               <div className = "w-full h-[10rem] rounded-2xl">
                  {
                     workout.image ? (
                        <Image
                           width = {1000}
                           height = {1000}
                           src = {workout.image}
                           alt = "workout-image"
                           className = {clsx("w-full h-full object-cover object-center rounded-2xl rounded-b-none cursor-pointer transition duration-300 ease-in-out")}
                        />
                     ) : (
                        null
                     )
                  }
               </div>
               <div className = "flex flex-col justify-start items-center gap-2 w-full h-[10rem] overflow-hidden text-center">
                  <h2 className = "font-bold text-xl mb-2 px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[90%]">{workout.title}</h2>
                  <p className = "text-gray-600 text-sm">{new Date(workout.date).toLocaleDateString()}</p>
               </div>
            </div>
         }
      />
   );
};

interface WorkoutCardsProps {
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout>>;
   reset: () => void;
}

export default function WorkoutCards(props: WorkoutCardsProps): JSX.Element {
   const { state } = props;
   const workouts: Workout[] = state.inputs.workouts.value;

   return (
      <div className = "flex flex-wrap justify-center space-x-6">
         {workouts.map((workout: Workout) => (
            <WorkoutCard {...props} workout = {workout} key = {workout.id} />
         ))}
      </div>
   );
}