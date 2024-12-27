import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { normalizeDate } from "@/lib/authentication/shared";
import { VitalityProps } from "@/lib/global/reducer";
import { verifyImageURL } from "@/lib/home/workouts/shared";
import { Tag } from "@/lib/home/workouts/tags";
import { Workout } from "@/lib/home/workouts/workouts";

interface CardProps extends CardsProps {
  workout: Workout;
}

function Card(props: CardProps): JSX.Element {
   const { workout, globalState, globalDispatch } = props;
   const [isValidImage, setIsValidImage] = useState<boolean>(true);

   const date = useMemo(() => {
      return normalizeDate(workout.date);
   }, [workout.date]);

   useEffect(() => {
      setIsValidImage(verifyImageURL(workout.image));
   }, [workout.image]);

   const workoutTags = useMemo(() => {
      return workout.tagIds.map((tagId: string) => {
         // Workout tag may be undefined in dictionary due to deletion
         const tag: Tag | undefined = globalState.tags.data?.dictionary[tagId];

         return (
            tag !== undefined && (
               <div
                  className = "m-1 max-w-full truncate rounded-full px-4 py-[0.45rem] text-[0.73rem] font-bold text-white"
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
      globalState.tags.data?.dictionary
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
                     value: {
                        value: workout,
                        data: {
                           display: true
                        }
                     }
                  }
               });
            }
         }
         className = "relative mx-0 flex h-[26rem] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 ease-in-out hover:scale-105 focus:scale-105 md:h-[23rem] md:w-72"
      >
         <div className = "relative mx-auto size-full">
            {
               workout.image && isValidImage ? (
                  <Image
                     fill
                     priority
                     quality = { 100 }
                     sizes = "100%"
                     src = { workout.image }
                     alt = "workout-image"
                     className = "object-cover object-center opacity-40"
                     onLoad = { () => !isValidImage && setIsValidImage(true) }
                     onErrorCapture = { () => isValidImage && setIsValidImage(false) }
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
            <div className = "relative flex size-full flex-col items-center justify-start overflow-hidden py-4 text-center text-black">
               <div className = "relative mx-auto my-2 w-full">
                  <h2 className = "max-w-full truncate break-words px-8 text-[1.4rem] font-extrabold md:text-[1.3rem]">
                     { workout.title }
                  </h2>
                  <p className = "translate-y-[-2px] text-base font-extrabold md:text-[0.9rem]">{ date }</p>
               </div>
               <div
                  className = {
                     clsx(
                        "scrollbar-hide mb-2 flex max-h-80 w-full max-w-[25rem] flex-row flex-wrap items-center justify-center gap-y-1 overflow-auto px-4 md:max-h-64",
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
         <div className = "mx-auto my-6 flex flex-row flex-wrap items-center justify-center gap-8">
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