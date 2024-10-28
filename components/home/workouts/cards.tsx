import clsx from "clsx";
import Image from "next/image";
import WorkoutForm from "./form";
import { VitalityProps } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { getWorkoutDate } from "@/lib/workouts/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";
import { Tag } from "@/lib/workouts/tags";

interface WorkoutCardProps extends WorkoutCardsProps {
   workout: Workout;
}

function WorkoutCard(props: WorkoutCardProps): JSX.Element {
   const { workout, globalState } = props;
   const workoutTags = useMemo(() => {
      return workout.tagIds.map((tagId: string) => {
         // Fetch tag using id
         const tag: Tag = globalState.tags.data.dictionary[tagId];

         return (
            // Undefined in case of removal
            tag !== undefined &&
            <div
               className={clsx("max-w-full px-3 py-1 m-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-full text-md lg:text-sm font-bold text-white transition duration-300 ease-in-out")}
               style={{
                  backgroundColor: tag.color
               }}
               key={tag.id}
            >
               {tag.title}
            </div>
         );
      });
   }, [workout, globalState.tags.data.dictionary]);

   return (
      <WorkoutForm
         {...props}
         cover={
            <div className="relative cursor-pointer flex flex-col justify-center items-center gap-2 w-[16rem] mx-auto rounded-2xl overflow-hidden shadow-xl bg-white hover:scale-105 transition duration-300 ease-in-out">
               <div className="w-full h-[23rem] rounded-2xl rounded-b-none shadow-md">
                  <div className="w-full h-full mx-auto">
                     {
                        workout.image ? (
                           <Image
                              quality={100}
                              layout="fill"
                              objectFit="cover"
                              sizes="100vw"
                              src={workout.image ?? ""}
                              alt="workout-image"
                              className="opacity-30"
                           />
                        ) : (
                           <div className="absolute w-full h-full bg-white opacity-30 flex justify-center items-center">
                              <FontAwesomeIcon
                                 className="text-7xl text-primary"
                                 icon={faImage} />
                           </div>
                        )
                     }
                     <div className="relative w-full h-full flex flex-col justify-start items-center overflow-hidden text-center pt-5">
                        <h2 className="font-bold text-2xl px-6 py-4 overflow-clip max-w-[90%] text-ellipsis whitespace-nowrap leading-none tracking-tight">{workout.title}</h2>
                        <p className="font-bold text-sm">{getWorkoutDate(workout.date)}</p>
                        <div className="flex flex-row flex-wrap justify-center items-center gap-2 p-2 overflow-y-scroll">
                           {workoutTags}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         }
      />
   );
};

interface WorkoutCardsProps extends VitalityProps {
   workouts: Workout[];
}

export default function WorkoutCards(props: WorkoutCardsProps): JSX.Element {
   const { workouts } = props;

   return (
      <div className="relative w-full mx-auto">
         <div className="flex flex-wrap justify-center items-center gap-6 mt-6">
            {workouts.map((workout: Workout) => (
               <WorkoutCard
                  {...props}
                  workout={workout}
                  key={workout.id} />
            ))}
         </div>
      </div>
   );
}