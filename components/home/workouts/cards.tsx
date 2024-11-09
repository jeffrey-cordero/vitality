import clsx from "clsx";
import Image from "next/image";
import { VitalityProps } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { getWorkoutDate } from "@/lib/workouts/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";
import { Tag } from "@/lib/workouts/tags";

interface CardProps extends CardsProps {
  workout: Workout;
}

function Card(props: CardProps): JSX.Element {
   const { workout, globalState, globalDispatch } = props;
   const workoutTags = useMemo(() => {
      return workout.tagIds.map((tagId: string) => {
         // Fetch workout tag, which may be missing in up-to-date dictionary due to a removal
         const tag: Tag | undefined = globalState.tags.data.dictionary[tagId];

         return (
            tag && (
               <div
                  className = {clsx(
                     "max-w-full px-4 py-2 m-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-full text-xs font-bold text-white",
                  )}
                  style = {{
                     backgroundColor: tag.color
                  }}
                  key = {tag.id}>
                  {tag.title}
               </div>
            )
         );
      });
   }, [
      workout,
      globalState.tags.data.dictionary
   ]);

   return (
      <div
         id = {workout.id}
         onClick = {() => {
            globalDispatch({
               type: "updateState",
               value: {
                  id: "workout",
                  input: {
                     ...globalState.workout,
                     value: workout,
                     data: {
                        display: true
                     }
                  }
               }
            });
         }}
         className = "relative cursor-pointer flex flex-col justify-center items-center gap-2 w-full sm:w-[16rem] h-[26rem] sm:h-[22rem] mx-auto sm:m-2 rounded-2xl overflow-hidden shadow-lg bg-white hover:scale-[1.02] transition duration-300 ease-in-out">
         <div className = "relative w-full h-full mx-auto">
            {workout.image ? (
               <Image
                  fill
                  priority
                  quality = {100}
                  sizes = "100%"
                  src = {workout.image}
                  alt = "workout-image"
                  className = "opacity-30 object-center object-cover"
               />
            ) : (
               <div className = "absolute w-full h-full bg-white opacity-20 flex justify-center items-center">
                  <FontAwesomeIcon
                     className = "text-7xl text-primary"
                     icon = {faImage}
                  />
               </div>
            )}
            <div className = "relative w-full h-full flex flex-col justify-start items-center overflow-hidden text-center pt-5">
               <h2 className = "font-bold text-2xl px-6 py-4 overflow-clip max-w-[90%] text-ellipsis whitespace-nowrap leading-none tracking-tight">
                  {workout.title}
               </h2>
               <p className = "font-bold text-sm">{getWorkoutDate(workout.date)}</p>
               <div
                  className = {clsx(
                     "w-full max-h-[15rem] flex flex-row flex-wrap justify-center items-center gap-2 p-2 overflow-auto scrollbar-hide",
                     {
                        "cursor-all-scroll": workoutTags.length > 0
                     },
                  )}>
                  {workoutTags}
               </div>
            </div>
         </div>
      </div>
   );
}

interface CardsProps extends VitalityProps {
  workouts: Workout[];
}

export default function Cards(props: CardsProps): JSX.Element {
   const { workouts } = props;

   return (
      <div className = "relative w-full mx-auto">
         <div className = "flex flex-row flex-wrap justify-center items-center gap-6 my-6">
            {workouts.map((workout: Workout) => (
               <Card
                  {...props}
                  workout = {workout}
                  key = {workout.id}
               />
            ))}
         </div>
      </div>
   );
}