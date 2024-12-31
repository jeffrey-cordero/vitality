import { faImage, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import Image from "next/image";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Confirmation from "@/components/global/confirmation";
import { normalizeDate } from "@/lib/authentication/shared";
import { VitalityProps } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { verifyImageURL } from "@/lib/home/workouts/shared";
import { Tag } from "@/lib/home/workouts/tags";
import { deleteWorkouts, Workout } from "@/lib/home/workouts/workouts";

interface RowProps extends VitalityProps {
   workout: Workout;
   index: number;
}

function Row(props: RowProps) {
   const { workout, globalState, globalDispatch } = props;
   const [isValidImage, setIsValidImage] = useState<boolean>(true);
   const selected: Set<Workout> = globalState.workouts.data?.selected;
   const isSelected: boolean = selected.has(workout);

   const date = useMemo(() => {
      return normalizeDate(workout.date);
   }, [workout.date]);

   useEffect(() => {
      setIsValidImage(verifyImageURL(workout.image));
   }, [workout.image]);

   const toggleWorkouts = useCallback(() => {
      // Add or remove desired workout from selected workouts
      const newSelected: Set<Workout> = new Set(selected);
      selected.has(workout) ? newSelected.delete(workout) : newSelected.add(workout);

      globalDispatch({
         type: "updateState",
         value: {
            id: "workouts",
            value: {
               data: {
                  selected: newSelected
               }
            }
         }
      });
   }, [
      workout,
      selected,
      globalDispatch
   ]);

   const workoutTags = useMemo(() => {
      return workout.tagIds.map((tagId: string) => {
         // Workout tag may be undefined in dictionary due to deletion
         const tag: Tag | undefined = globalState.tags.data?.dictionary[tagId];

         return (
            tag !== undefined && (
               <div
                  className = "m-1 max-w-full truncate rounded-full px-4 py-[0.2rem] text-[0.8rem] font-bold text-white lg:text-[0.73rem]"
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
         className = {
            clsx("mx-auto flex min-h-60 w-full cursor-pointer flex-col items-center justify-between p-6 text-center text-lg lg:flex-row lg:rounded-none lg:p-6 lg:text-lg", {
               "bg-gray-100 dark:bg-gray-700": isSelected,
               "bg-white dark:bg-slate-800": !isSelected
            })
         }
         onClick = { toggleWorkouts }
      >
         <div className = "order-3 w-full max-w-[26rem] items-center justify-center px-4 pb-2 text-[1.25rem] font-medium [overflow-wrap:anywhere] lg:order-none lg:w-40 lg:px-6 lg:py-4 lg:text-lg">
            { workout.title }
         </div>
         <div className = "order-1 flex w-full flex-row items-center justify-center gap-3 whitespace-pre-wrap break-all px-4 text-lg font-medium lg:order-none lg:w-40 lg:px-6 lg:py-4 lg:text-lg">
            { date }
         </div>
         <div className = "scrollbar-hide order-4 w-full overflow-auto whitespace-pre-wrap break-all px-2 sm:px-12 lg:order-none lg:max-h-48 lg:w-48 lg:p-1">
            <div
               className = {
                  clsx("mx-auto my-1 flex max-h-full w-full max-w-80 flex-row flex-wrap items-center justify-center gap-1 overflow-auto", {
                     "cursor-all-scroll": workoutTags.length > 0
                  })
               }
            >
               { workoutTags }
            </div>
         </div>
         <div
            className = { clsx("relative order-1 my-4 whitespace-pre-wrap break-all lg:order-none lg:my-0") }
         >
            {
               workout.image && isValidImage ? (
                  <div className = "relative order-2 flex size-36 items-center justify-center min-[275px]:size-44 min-[375px]:size-52 lg:order-none lg:size-36">
                     <Image
                        fill
                        priority
                        quality = { 100 }
                        sizes = "100%"
                        src = { workout.image }
                        alt = "workout-image"
                        className = { clsx("mx-auto size-full overflow-hidden rounded-full object-cover object-center shadow-sm") }
                        onLoad = { () => !isValidImage && setIsValidImage(true) }
                        onErrorCapture = { () => isValidImage && setIsValidImage(false) }
                     />
                  </div>
               ) : (
                  <div className = "order-2 flex size-36 items-center justify-center overflow-hidden rounded-full min-[275px]:size-44 min-[375px]:size-52 lg:order-none lg:size-36">
                     <FontAwesomeIcon
                        className = "text-[3.75rem] text-primary min-[275px]:text-[3.8rem] min-[375px]:text-[4.3rem] lg:text-5xl"
                        icon = { faImage }
                     />
                  </div>
               )
            }
         </div>
         <div className = "order-5 w-full whitespace-pre-wrap break-all text-xl font-bold uppercase text-black lg:order-none lg:w-12 lg:px-6 lg:py-4 lg:text-lg">
            <div className = "flex items-center justify-center gap-4">
               <div
                  className = "flex items-center justify-center"
                  onClick = {
                     (event) => {
                        event.stopPropagation();

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
               >
                  <div className = "block px-8 pt-2 lg:pt-0">
                     <FontAwesomeIcon
                        icon = { faPenToSquare }
                        className = " cursor-pointer text-xl text-primary hover:text-primary/80 lg:text-lg"
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

interface TableProps extends VitalityProps {
   workouts: Workout[];
}

export default function Table(props: TableProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { workouts, globalState, globalDispatch } = props;
   // Selected workouts are stored in global state for potential bulk removals
   const selected: Set<Workout> = globalState.workouts.data?.selected;

   const visibleSelectedWorkouts = useMemo(() => {
      return new Set<Workout>(workouts.filter(
         (workout) => selected.has(workout))
      );
   }, [
      selected,
      workouts
   ]);

   const toggleWorkouts = useCallback(() => {
      // Toggle workouts based on current selection
      let newSelected: Set<Workout>;

      if (visibleSelectedWorkouts.size === workouts.length) {
         newSelected = new Set([...Array.from(selected)].filter(
            (workout) => !visibleSelectedWorkouts.has(workout))
         );
      } else {
         newSelected = new Set([...Array.from(selected), ...workouts]);
      }

      globalDispatch({
         type: "updateState",
         value: {
            id: "workouts",
            value: {
               data: {
                  selected: newSelected
               }
            }
         }
      });

   }, [
      workouts,
      selected,
      globalDispatch,
      visibleSelectedWorkouts
   ]);

   const submitDeleteWorkouts = useCallback(async() => {
      const response: VitalityResponse<number> = await deleteWorkouts(user.id, Array.from(visibleSelectedWorkouts));

      processResponse(response, globalDispatch, updateNotifications, () => {
         const newWorkouts: Workout[] = [...globalState.workouts.value].filter(
            (workout: Workout) =>  !(visibleSelectedWorkouts.has(workout))
         );

         const newFiltered: Workout[] = [...globalState.workouts.data?.filtered].filter(
            (workout: Workout) => !(visibleSelectedWorkouts.has(workout))
         );

         const newSelected: Set<Workout> = new Set(selected);

         visibleSelectedWorkouts.forEach(
            (workout) => newSelected.delete(workout)
         );

         // Account for pagination values when deleting workouts
         const pages: number = Math.ceil(newWorkouts.length / globalState.paging.value);
         const page: number = globalState.page.value;

         globalDispatch({
            type: "updateStates",
            value: {
               workouts: {
                  value: newWorkouts,
                  data: {
                     filtered: newFiltered,
                     selected: newSelected
                  }
               },
               page: {
                  value: page >= pages ? Math.max(0, page - 1) : page
               }
            }
         });

         updateNotifications({
            status: response.status,
            message: response.body.message,
            timer: 1000
         });
      });
   }, [
      user,
      selected,
      globalState,
      globalDispatch,
      updateNotifications,
      visibleSelectedWorkouts
   ]);

   return (
      <div className = "relative mx-auto w-full">
         <div className = "mx-auto my-6 overflow-hidden rounded-2xl shadow-md">
            <div className = "block bg-white py-4 lg:hidden dark:bg-slate-800">
               <input
                  id = "workout-select-all-mobile"
                  type = "checkbox"
                  checked = { visibleSelectedWorkouts.size === workouts.length }
                  className = "size-4 cursor-pointer rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                  onChange = { () => toggleWorkouts() }
               />
            </div>
            <div className = "mx-auto hidden w-full items-center justify-between bg-white lg:flex lg:p-6 dark:bg-slate-800">
               <div className = "flex w-40 items-center justify-center gap-2 whitespace-pre-wrap break-all text-xl font-bold uppercase lg:px-6 lg:py-4 lg:text-lg">
                  Title
               </div>
               <div className = "flex w-40 items-center justify-center gap-2 whitespace-pre-wrap break-all text-xl font-bold uppercase lg:px-6 lg:py-4 lg:text-lg">
                  Date
               </div>
               <div className = "flex w-48 items-center justify-center gap-2 whitespace-pre-wrap break-all text-xl font-bold uppercase lg:px-6 lg:py-4 lg:text-lg">
                  Tags
               </div>
               <div className = "flex w-36 items-center justify-center gap-2 whitespace-pre-wrap break-all text-xl font-bold uppercase lg:px-6 lg:py-4 lg:text-lg">
                  Image
               </div>
               <div className = "flex w-12 items-center justify-center whitespace-normal py-4 text-base font-bold uppercase text-black">
                  <input
                     id = "workout-select-all-desktop"
                     type = "checkbox"
                     checked = { visibleSelectedWorkouts.size === workouts.length }
                     className = "size-4 cursor-pointer rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                     onChange = { () => toggleWorkouts() }
                  />
               </div>
            </div>
            <div className = "mx-auto flex w-full flex-col bg-white lg:p-0 dark:bg-slate-800">
               {
                  workouts.map((workout: Workout, index: number) => (
                     <Row
                        workout = { workout }
                        index = { index }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                        key = { workout.id }
                     />
                  ))
               }
            </div>
            {
               visibleSelectedWorkouts.size > 0 && (
                  <Confirmation
                     message = { `Delete ${visibleSelectedWorkouts.size} workout${visibleSelectedWorkouts.size === 1 ? "" : "s"}?` }
                     onConfirmation = { submitDeleteWorkouts }
                     icon
                  />
               )
            }
         </div>
      </div >
   );
}