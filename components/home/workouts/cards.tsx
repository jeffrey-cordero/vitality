import clsx from "clsx";
import Image from "next/image";
import { VitalityProps } from "@/lib/global/state";
import { Workout } from "@/lib/home/workouts/workouts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";
import { Tag } from "@/lib/home/workouts/tags";

interface CardProps extends CardsProps {
  workout: Workout;
}

function Card(props: CardProps): JSX.Element {
   const { workout, globalState, globalDispatch } = props;

   const formattedDate = useMemo(() => {
      return workout.date.toISOString().slice(0, 10);
   }, [workout.date]);

   const workoutTags = useMemo(() => {
      return workout.tagIds.map((tagId: string) => {
         // Fetch workout tag, which may be missing in up-to-date dictionary due to a removal
         const tag: Tag | undefined = globalState.tags.data.dictionary[tagId];

         return (
            tag && (
               <div
                  className = {
                     clsx(
                        "m-1 max-w-full truncate rounded-full px-4 py-2 text-xs font-bold text-white",
                     )
                  }
                  style = {
                     {
                        backgroundColor: tag.color
                     }
                  }
                  key = { tag.id }
               >
                  { tag.title }
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
         id = { workout.id }
         onClick = {
            () => {
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
            }
         }
         className = "relative mx-auto flex h-[26rem] w-full min-w-full flex-1 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 ease-in-out hover:scale-[1.03] xsm:min-w-72 sm:h-[22rem] sm:min-w-64"
      >
         <div className = "relative mx-auto size-full">
            {
               workout.image ? (
                  <Image
                     fill
                     priority
                     quality = { 100 }
                     sizes = "100%"
                     src = { workout.image }
                     alt = "workout-image"
                     className = "object-cover object-center opacity-40"
                  />
               ) : (
                  <div className = "absolute flex size-full items-center justify-center bg-white opacity-40">
                     <FontAwesomeIcon
                        className = "text-7xl text-primary"
                        icon = { faImage }
                     />
                  </div>
               )
            }
            <div className = "relative flex size-full flex-col items-center justify-start overflow-hidden pt-5 text-center text-black">
               <h2 className = "max-w-full truncate break-words px-6 pt-2 text-[1.5rem] font-extrabold sm:text-[1.3rem]">
                  { workout.title }
               </h2>
               <p className = "text-sm font-extrabold sm:text-[0.8rem]">{ formattedDate }</p>
               <div
                  className = {
                     clsx(
                        "scrollbar-hide flex max-h-60 w-full max-w-[25rem] flex-row flex-wrap items-center justify-center overflow-auto px-4 py-2",
                        {
                           "cursor-all-scroll": workoutTags.length > 0
                        },
                     )
                  }
               >
                  { workoutTags }
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
      <div className = "relative mx-auto w-full">
         <div className = "mx-auto my-6 flex flex-row flex-wrap items-center justify-items-center gap-8">
            {
               workouts.map((workout: Workout) => (
                  <Card
                     { ...props }
                     workout = { workout }
                     key = { workout.id }
                  />
               ))
            }

         </div>
      </div>
   );
}