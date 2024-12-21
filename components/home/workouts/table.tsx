import clsx from "clsx";
import Image from "next/image";
import Confirmation from "@/components/global/confirmation";
import { Tag } from "@/lib/home/workouts/tags";
import { VitalityProps } from "@/lib/global/state";
import { verifyImageURL } from "@/lib/home/workouts/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponse, VitalityResponse } from "@/lib/global/response";
import { deleteWorkouts, Workout } from "@/lib/home/workouts/workouts";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { faImage, faPenToSquare, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface RowProps extends VitalityProps {
   workout: Workout;
   index: number;
}

function Row(props: RowProps) {
   const { workout, globalState, globalDispatch } = props;
   const [isValidImage, setIsValidImage] = useState<boolean>(true);
   const selected: Set<Workout> = globalState.workouts.data.selected;
   const isSelected: boolean = selected.has(workout);

   useEffect(() => {
      setIsValidImage(verifyImageURL(workout.image));
   }, [workout.image]);

   const formattedDate = useMemo(() => {
      return workout.date.toISOString().slice(0, 10).replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1");
   }, [workout.date]);

   const handleWorkoutToggle = useCallback(() => {
      const newSelected: Set<Workout> = new Set(selected);
      // Add or remove desired workout from selected workouts for potential bulk removals
      selected.has(workout) ? newSelected.delete(workout) : newSelected.add(workout);

      globalDispatch({
         type: "updateState",
         value: {
            id: "workouts",
            input: {
               ...globalState.workouts,
               data: {
                  ...globalState.workouts.data,
                  selected: newSelected
               }
            }
         }
      });
   }, [
      globalDispatch,
      selected,
      globalState.workouts,
      workout
   ]);

   const workoutTags = useMemo(() => {
      return workout.tagIds.map((tagId: string) => {
         const tag: Tag | undefined = globalState.tags.data.dictionary[tagId];

         return (
            // Workout tag may be undefined in global state dictionary due to a potential removal or error
            tag !== undefined && (
               <div
                  className = { clsx("m-1 max-w-full truncate rounded-full px-4 py-[0.2rem] text-[0.8rem] font-bold text-white lg:text-[0.73rem]") }
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

   const handleEditWorkout = useCallback(() => {
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
   }, [globalDispatch, globalState.workout, workout]);

   return (
      <div
         id = { workout.id }
         className = {
            clsx("mx-auto flex w-full cursor-pointer flex-col items-center justify-between p-6 text-center text-lg lg:flex-row lg:rounded-none lg:p-6 lg:text-lg", {
               "bg-gray-100 dark:bg-gray-700": isSelected,
               "bg-white dark:bg-slate-800": !isSelected
            })
         }
         onClick = { handleWorkoutToggle }
      >
         <div className = "order-3 w-full max-w-[26rem] items-center justify-center px-4 pb-2 text-[1.25rem] font-medium [overflow-wrap:anywhere] lg:order-none lg:w-40 lg:px-6 lg:py-4 lg:text-lg">
            { workout.title }
         </div>
         <div className = "order-1 flex w-full flex-row items-center justify-center gap-3 whitespace-pre-wrap break-all px-4 text-lg font-medium lg:order-none lg:w-40 lg:px-6 lg:py-4 lg:text-lg">
            { formattedDate }
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
                        className = {
                           clsx("text-[3.75rem] min-[275px]:text-[3.8rem] min-[375px]:text-[4.3rem] lg:text-5xl", {
                              "text-primary": isValidImage,
                              "text-red-500": !isValidImage
                           })
                        }
                        icon = { !isValidImage ? faTriangleExclamation : faImage }
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
                        handleEditWorkout();
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
   const { updateNotification } = useContext(NotificationContext);
   const { workouts, globalState, globalDispatch } = props;
   const selected: Set<Workout> = globalState.workouts.data.selected;

   const visibleSelectedWorkouts = useMemo(() => {
      return new Set<Workout>(workouts.filter(workout => selected.has(workout)));
   }, [
      workouts,
      selected
   ]);

   const handleUpdateSelectedWorkouts = useCallback(
      (newSelected: Set<Workout>) => {
         globalDispatch({
            type: "updateState",
            value: {
               id: "workouts",
               input: {
                  ...globalState.workouts,
                  data: {
                     ...globalState.workouts.data,
                     selected: newSelected
                  }
               }
            }
         });
      }, [
         globalDispatch,
         globalState.workouts
      ]);

   const handleWorkoutToggle = useMemo(() => {
      return () => {
         // Remove or select all visible selected workouts
         if (visibleSelectedWorkouts.size === workouts.length) {
            handleUpdateSelectedWorkouts(new Set([...Array.from(selected)].filter(workout => !visibleSelectedWorkouts.has(workout))));
         } else {
            handleUpdateSelectedWorkouts(new Set([...Array.from(selected), ...workouts]));
         }
      };
   }, [
      workouts,
      selected,
      visibleSelectedWorkouts,
      handleUpdateSelectedWorkouts
   ]);

   const handleWorkoutDelete = useCallback(async() => {
      const response: VitalityResponse<number> = await deleteWorkouts(user.id, Array.from(visibleSelectedWorkouts));

      handleResponse(response, globalDispatch, updateNotification, () => {
         const newWorkouts: Workout[] = [...globalState.workouts.value].filter((w: Workout) => {
            return !(visibleSelectedWorkouts.has(w));
         });

         const newFiltered: Workout[] = [...globalState.workouts.data.filtered].filter((w: Workout) => {
            return !(visibleSelectedWorkouts.has(w));
         });

         const newSelected: Set<Workout> = new Set(selected);

         visibleSelectedWorkouts.forEach(
            (workout) => newSelected.delete(workout)
         );

         // Account for current page being discard in pagination view
         const pages: number = Math.ceil(newWorkouts.length / globalState.paging.value);
         const page: number = globalState.page.value;

         globalDispatch({
            type: "updateStates",
            value: {
               workouts: {
                  ...globalState.workouts,
                  value: newWorkouts,
                  data: {
                     ...globalState.workouts.data,
                     filtered: newFiltered,
                     selected: newSelected
                  }
               },
               page: {
                  ...globalState.page,
                  value: page >= pages ? Math.max(0, page - 1) : page
               }
            }
         });

         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1000
         });
      });
   }, [
      user,
      globalDispatch,
      selected,
      globalState,
      updateNotification,
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
                  onChange = { () => handleWorkoutToggle() }
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
                     onChange = { () => handleWorkoutToggle() }
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
                     onConfirmation = { () => handleWorkoutDelete() }
                     icon
                  />
               )
            }
         </div>
      </div >
   );
}