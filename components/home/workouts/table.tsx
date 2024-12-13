import clsx from "clsx";
import Image from "next/image";
import Confirmation from "@/components/global/confirmation";
import { VitalityProps } from "@/lib/global/state";
import { VitalityResponse } from "@/lib/global/response";
import { faImage, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { deleteWorkouts, Workout } from "@/lib/home/workouts/workouts";
import { Tag } from "@/lib/home/workouts/tags";
import { useCallback, useContext, useMemo } from "react";
import { AuthenticationContext, NotificationContext } from "@/app/layout";

interface RowProps extends VitalityProps {
   workout: Workout;
   index: number;
}

function Row(props: RowProps) {
   const { workout, globalState, globalDispatch } = props;
   const selected: Set<Workout> = globalState.workouts.data.selected;
   const isSelected = selected.has(workout);

   const formattedDate = useMemo(() => {
      return workout.date.toISOString().slice(0, 10);
   }, [workout.date]);

   const handleWorkoutToggle = useCallback(() => {
      // Add or remove desired workout from set of selected workouts
      const newSelected: Set<Workout> = new Set(selected);

      if (newSelected.has(workout)) {
         newSelected.delete(workout);
      } else {
         newSelected.add(workout);
      }

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
         // Fetch tag using id
         const tag: Tag = globalState.tags.data.dictionary[tagId];

         return (
            // Undefined in case of removal
            tag !== undefined && (
               <div
                  className = { clsx("m-1 max-w-full truncate rounded-full px-4 py-1 text-[0.8rem] font-bold text-white lg:text-[0.75rem]") }
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
               workout.image ? (
                  <div className = "relative order-2 flex size-36 items-center justify-center min-[275px]:size-44 min-[375px]:size-52 lg:order-none lg:size-36">
                     <Image
                        fill
                        priority
                        quality = { 100 }
                        sizes = "100%"
                        src = { workout.image }
                        alt = "workout-image"
                        className = { clsx("mx-auto size-full overflow-hidden rounded-full object-cover object-center shadow-sm") }
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
                        handleEditWorkout();
                     }
                  }
               >
                  <div className = "block px-8 pt-2 lg:pt-0">
                     <FontAwesomeIcon
                        icon = { faPencil }
                        className = " cursor-pointer text-xl text-primary transition duration-300 ease-in-out hover:scale-125 lg:text-lg"
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

   // Filtered workouts that have been selected
   const visibleSelectedWorkouts = useMemo(() => {
      return new Set<Workout>(workouts.filter(workout => selected.has(workout)));
   }, [
      workouts,
      selected
   ]);

   // Determines if all visible workouts are selected
   const allVisibleSelected: boolean = workouts.length > 0
      && workouts.every(workout => selected.has(workout));

   // Function to update selected workouts in the globalState
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
         if (allVisibleSelected) {
            // Remove all visibly selected workouts
            handleUpdateSelectedWorkouts(new Set([...Array.from(selected)]
               .filter(workout => !visibleSelectedWorkouts.has(workout))));
         } else {
            // Select all visible workouts
            handleUpdateSelectedWorkouts(new Set([...Array.from(selected), ...workouts]));
         }
      };
   }, [
      allVisibleSelected,
      handleUpdateSelectedWorkouts,
      workouts,
      selected,
      visibleSelectedWorkouts
   ]);

   const handleWorkoutDelete = useCallback(async() => {
      const size: number = visibleSelectedWorkouts.size;
      const response: VitalityResponse<number> =
         await deleteWorkouts(Array.from(visibleSelectedWorkouts), user.id);

      if (response.body.data as number === size) {
         // Remove single or multiple workouts from overall, filtered, and selected workouts
         const newWorkouts = [...globalState.workouts.value].filter((w: Workout) => {
            return !(visibleSelectedWorkouts.has(w));
         });

         const newFiltered = [...globalState.workouts.data.filtered].filter((w: Workout) => {
            return !(visibleSelectedWorkouts.has(w));
         });

         const newSelected = new Set(selected);
         visibleSelectedWorkouts.forEach(workout => newSelected.delete(workout));

         // Account for a page being removed in pagination view
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
      }

      updateNotification({
         status: response.status,
         message: response.body.message,
         timer: 1000
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
         <div className = "mx-auto mb-10 mt-6 overflow-hidden rounded-2xl shadow-md">
            <div className = "block bg-white py-4 lg:hidden dark:bg-slate-800">
               <input
                  id = "workout-select-all-mobile"
                  type = "checkbox"
                  checked = { allVisibleSelected }
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
                     checked = { allVisibleSelected }
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