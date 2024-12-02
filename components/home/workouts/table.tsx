import clsx from "clsx";
import Image from "next/image";
import Button from "@/components/global/button";
import Conformation from "@/components/global/confirmation";
import { VitalityProps } from "@/lib/global/state";
import { VitalityResponse } from "@/lib/global/response";
import { faImage, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { deleteWorkouts, Workout } from "@/lib/home/workouts/workouts";
import { Tag } from "@/lib/home/workouts/tags";
import { useCallback, useContext, useMemo } from "react";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { useDoubleTap } from "use-double-tap";

interface RowProps extends VitalityProps {
   workout: Workout;
   index: number;
}

function Row(props: RowProps) {
   const { workout, globalState, globalDispatch } = props;
   const selected: Set<Workout> = globalState.workouts.data.selected;

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
                  className = { clsx("m-2 max-w-full truncate rounded-full px-4 py-2 text-xs font-bold text-white") }
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

   const doubleTap = useDoubleTap(handleEditWorkout);

   return (
      <div
         id = { workout.id }
         className = "mx-auto flex w-full cursor-pointer flex-col items-center justify-between rounded-md bg-white text-center hover:bg-gray-50 lg:flex-row lg:rounded-none lg:p-4 dark:bg-slate-800 dark:hover:bg-gray-700"
         { ...doubleTap }
      >
         <div className = "flex w-full items-center justify-center whitespace-normal px-3 py-4 pt-6 text-base uppercase lg:w-4 lg:pt-4">
            <input
               id = { `workout-select-${workout.id}` }
               type = "checkbox"
               className = "size-4 cursor-pointer rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
               checked = { globalState.workouts.data.selected.has(workout) }
               onChange = { () => handleWorkoutToggle() }
            />
         </div>
         <div className = "w-full whitespace-pre-wrap break-all px-2 text-xl lg:w-40 lg:px-6 lg:py-4 lg:text-base">
            { workout.title }
         </div>
         <div className = "w-full whitespace-pre-wrap break-all px-2 pt-2 text-xl lg:w-40 lg:px-6 lg:py-4 lg:text-base">
            { formattedDate }
         </div>
         <div className = "scrollbar-hide w-full overflow-auto whitespace-pre-wrap break-all px-12 text-xl lg:max-h-48 lg:w-48 lg:px-6 lg:py-4 lg:text-base">
            <div
               className = {
                  clsx("scrollbar-hide flex max-h-56 w-full flex-row flex-wrap items-center justify-center gap-2 overflow-auto p-2", {
                     "cursor-all-scroll": workoutTags.length > 0
                  })
               }
            >
               { workoutTags }
            </div>
         </div>
         <div
            className = { clsx("relative order-first mt-8 whitespace-pre-wrap break-all text-xl lg:order-none  lg:mt-0 lg:text-base") }
         >
            {
               workout.image ? (
                  <div className = "relative flex size-56 items-center justify-center lg:size-28">
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
                  <div className = "flex size-56 items-center justify-center overflow-hidden rounded-full text-primary lg:size-28">
                     <FontAwesomeIcon
                        className = "text-4xl"
                        icon = { faImage }
                     />
                  </div>
               )
            }
         </div>
         <div className = "w-full whitespace-pre-wrap break-all text-xl font-bold uppercase text-black lg:w-12 lg:px-6 lg:py-4 lg:text-base">
            <div className = "flex items-center justify-center gap-4">
               <div
                  className = "flex items-center justify-center"
                  onClick = { handleEditWorkout }
               >
                  <div className = "hidden px-8 lg:block">
                     <FontAwesomeIcon
                        icon = { faPencil }
                        className = " cursor-pointer text-base text-primary transition duration-300 ease-in-out hover:scale-125"
                     />
                  </div>
                  <div className = "block lg:hidden">
                     <Button
                        type = "button"
                        className = "mb-6 mt-2 block h-[2.4rem] w-40 bg-primary p-4 text-sm text-white lg:hidden"
                        icon = { faPencil }
                     >
                        Edit Workout
                     </Button>
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
         <div className = "container mx-auto my-6 overflow-hidden rounded-xl shadow-md">
            <div className = "block bg-white p-4 lg:hidden dark:bg-slate-800">
               <input
                  id = "workout-select-all-mobile"
                  type = "checkbox"
                  checked = { allVisibleSelected }
                  className = "size-4 cursor-pointer rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                  onChange = { () => handleWorkoutToggle() }
               />
            </div>
            <div className = "mx-auto hidden w-full items-center justify-between bg-white p-4 lg:flex dark:bg-slate-800">
               <div className = "flex w-4 items-center justify-center whitespace-normal px-3 py-4 text-base font-bold uppercase">
                  <input
                     id = "workout-select-all-desktop"
                     type = "checkbox"
                     checked = { allVisibleSelected }
                     className = "size-4 cursor-pointer rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                     onChange = { () => handleWorkoutToggle() }
                  />
               </div>
               <div className = "w-40 whitespace-pre-wrap break-all text-xl font-bold uppercase lg:px-6 lg:py-4 lg:text-base">
                  Title
               </div>
               <div className = "w-40 whitespace-pre-wrap break-all text-xl font-bold uppercase lg:px-6 lg:py-4 lg:text-base">
                  Date
               </div>
               <div className = "w-48 whitespace-pre-wrap break-all text-xl font-bold uppercase lg:px-6 lg:py-4 lg:text-base">
                  Tags
               </div>
               <div className = "w-28 whitespace-pre-wrap break-all text-xl font-bold uppercase lg:px-6 lg:py-4 lg:text-base">
                  Image
               </div>
               <div className = "w-12 whitespace-pre-wrap break-all text-xl font-bold uppercase lg:px-6 lg:py-4 lg:text-base">
               </div>
            </div>
            <div className = "mx-auto flex w-full flex-col gap-2 bg-white lg:gap-0">
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
                  <Conformation
                     message = { `Delete ${visibleSelectedWorkouts.size} workout${visibleSelectedWorkouts.size === 1 ? "" : "s"}?` }
                     onConformation = { () => handleWorkoutDelete() }
                     icon
                  />
               )
            }
         </div>
      </div >
   );
}