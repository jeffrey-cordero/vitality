import clsx from "clsx";
import Image from "next/image";
import Button from "@/components/global/button";
import { VitalityProps, VitalityResponse } from "@/lib/global/state";
import { faImage, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { removeWorkouts, Workout } from "@/lib/workouts/workouts";
import { getWorkoutDate } from "@/lib/workouts/shared";
import { Tag } from "@/lib/workouts/tags";
import { useCallback, useContext, useMemo } from "react";
import { NotificationContext } from "@/app/layout";
import Conformation from "@/components/global/confirmation";

interface RowProps extends VitalityProps {
   workout: Workout;
   index: number;
}

function Row(props: RowProps) {
   const { workout, globalState, globalDispatch } = props;
   const selected: Set<Workout> = globalState.workouts.data.selected;
   const formattedDate = useMemo(() => getWorkoutDate(new Date(workout.date)), [workout.date]);

   const handleWorkoutToggle = useCallback(() => {
      // Either add or remove from selected
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
   }, [globalDispatch, selected, globalState.workouts, workout]);

   const workoutTags = useMemo(() => {
      return workout.tagIds.map((tagId: string) => {
         // Fetch tag using id
         const tag: Tag = globalState.tags.data.dictionary[tagId];

         return (
            // Undefined in case of removal
            tag !== undefined &&
            <div
               className = {clsx("max-w-full px-4 py-2 m-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-full text-xs font-bold text-white")}
               style = {{
                  backgroundColor: tag.color
               }}
               key = {tag.id}>
               {tag.title}
            </div>
         );
      });
   }, [workout, globalState.tags.data.dictionary]);

   return (
      <div
         id = {workout.id}
         className = "flex flex-col lg:flex-row justify-between items-center text-center w-full mx-auto bg-white lg:p-4 rounded-md lg:rounded-none">
         <div className = "w-full lg:w-[1rem] flex justify-center items-center text-base uppercase px-3 pt-6 py-4 lg:pt-4 whitespace-normal font-medium text-black">
            <input
               id = {`workout-select-${workout.id}`}
               type = "checkbox"
               className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
               checked = {globalState.workouts.data.selected.has(workout)}
               onChange = {() => handleWorkoutToggle()}
            />
         </div>
         <div className = "w-full lg:w-[10rem] text-xl lg:text-base font-medium px-2 lg:px-6 lg:py-4 whitespace-pre-wrap break-all text-black">
            {workout.title}
         </div>
         <div className = "w-full lg:w-[10rem] text-xl lg:text-base font-medium px-2 lg:px-6 lg:py-4 whitespace-pre-wrap break-all text-black">
            {formattedDate}
         </div>
         <div className = "w-full lg:w-[12rem] lg:max-h-[12rem] overflow-auto scrollbar-hide text-xl lg:text-base font-medium px-12 lg:px-6 lg:py-4 whitespace-pre-wrap break-all text-black">
            <div
               className = {clsx("w-full max-h-[15rem] flex flex-row flex-wrap justify-center items-center gap-2 p-2 overflow-auto scrollbar-hide", {
                  "cursor-all-scroll": workoutTags.length > 0
               })}>
               {workoutTags}
            </div>
         </div>
         <div
            className = {clsx("relative order-first lg:order-none mt-8 lg:mt-0 text-xl lg:text-base font-medium whitespace-pre-wrap break-all text-black")}>
            {
               workout.image ? (
                  <div className = "relative w-[15rem] h-[15rem] lg:w-[8rem] lg:h-[8rem] flex justify-center items-center">
                     <Image
                        fill
                        priority
                        quality = {100}
                        sizes = "100%"
                        src = {workout.image}
                        alt = "workout-image"
                        className = {clsx("w-full h-full mx-auto object-cover object-center rounded-full overflow-hidden shadow-sm")}
                     />
                  </div>

               ) : (
                  <div className = "w-[15rem] h-[15rem] lg:w-[8rem] lg:h-[8rem] flex justify-center items-center rounded-full overflow-hidden text-primary">
                     <FontAwesomeIcon
                        className = "text-4xl"
                        icon = {faImage}
                     />
                  </div>
               )
            }
         </div>
         <div className = "w-full lg:w-[3rem] text-xl lg:text-base font-bold uppercase lg:px-6 lg:py-4 whitespace-pre-wrap break-all text-black">
            <div className = "flex justify-center items-center gap-4">
               <div
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
                  className = "flex justify-center items-center">
                  <div className = "hidden lg:block px-8">
                     <FontAwesomeIcon
                        icon = {faPencil}
                        className = " text-primary cursor-pointer text-md hover:scale-125 transition duration-300 ease-in-out"
                     />
                  </div>
                  <div className = "block lg:hidden">
                     <Button
                        type = "button"
                        className = "block lg:hidden bg-primary text-white w-[10rem] mt-2 mb-6 h-[2.4rem] p-4 text-sm"
                        icon = {faPencil}>
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
   const { updateNotification } = useContext(NotificationContext);
   const { workouts, globalState, globalDispatch } = props;
   const selected: Set<Workout> = globalState.workouts.data.selected;

   // Visible workouts that have been selected
   const visibleSelectedWorkouts = useMemo(() => {
      return new Set<Workout>(workouts.filter(workout => selected.has(workout)));
   }, [workouts, selected]);

   // Check if all visible workouts are selected
   const allVisibleSelected: boolean = workouts.length > 0 && workouts.every(workout => selected.has(workout));

   // Function to update selected workouts in the globalState
   const handleUpdateSelectedWorkouts = useCallback((newSelected: Set<Workout>) => {
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
   }, [globalDispatch, globalState.workouts]);

   const handleWorkoutToggle = useMemo(() => {
      return () => {
         if (allVisibleSelected) {
            // Remove all visibly selected workouts
            handleUpdateSelectedWorkouts(new Set([...Array.from(selected)].filter(workout => !visibleSelectedWorkouts.has(workout))));
         } else {
            // Select all visible workouts
            handleUpdateSelectedWorkouts(new Set([...Array.from(selected), ...workouts]));
         }
      };
   }, [allVisibleSelected, handleUpdateSelectedWorkouts, workouts, selected, visibleSelectedWorkouts]);

   const handleWorkoutDelete = useCallback(async() => {
      // Remove the current or visibleSelectedWorkouts set of workout's
      const size = visibleSelectedWorkouts.size;

      // Remove the singular workout or only the visible workouts in the current view
      const response: VitalityResponse<number> = await removeWorkouts(Array.from(visibleSelectedWorkouts));

      if (response.body.data === size) {
         // Remove single or multiple workouts from overall, filtered, and selected workouts
         const newWorkouts = [...globalState.workouts.value].filter((w: Workout) => {
            return !(visibleSelectedWorkouts.has(w));
         });

         const newFiltered = [...globalState.workouts.data.filtered].filter((w: Workout) => {
            return !(visibleSelectedWorkouts.has(w));
         });

         const newSelected = new Set(selected);
         visibleSelectedWorkouts.forEach(workout => newSelected.delete(workout));

         // Account for a page in workouts view being removed
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
                     // Clear selected workouts
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

      // Display the success or failure notification to the user
      updateNotification({
         status: response.status,
         message: response.body.message,
         timer: 1000
      });

   }, [globalDispatch, selected, globalState, updateNotification, visibleSelectedWorkouts]);

   return (
      <div className = "relative w-full mx-auto">
         <div className = "my-6 overflow-hidden rounded-xl shadow-md">
            <div className = "block lg:hidden bg-white p-4">
               <input
                  id = "workout-select-all-mobile"
                  type = "checkbox"
                  checked = {allVisibleSelected}
                  className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 `border-`gray-300 rounded focus:ring-blue-500"
                  onChange = {() => handleWorkoutToggle()}
               />
            </div>
            <div className = "hidden lg:flex justify-between items-center w-full mx-auto bg-white p-4">
               <div className = "w-[1rem] flex justify-center items-center text-base uppercase px-3 py-4 whitespace-normal font-bold text-black">
                  <input
                     id = "workout-select-all-desktop"
                     type = "checkbox"
                     checked = {allVisibleSelected}
                     className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 `border-`gray-300 rounded focus:ring-blue-500"
                     onChange = {() => handleWorkoutToggle()}
                  />
               </div>
               <div className = "w-[10rem] text-xl lg:text-base font-bold uppercase lg:px-6 lg:py-4 whitespace-pre-wrap break-all text-black">
                  Title
               </div>
               <div className = "w-[10rem] text-xl lg:text-base font-bold uppercase lg:px-6 lg:py-4 whitespace-pre-wrap break-all text-black">
                  Date
               </div>
               <div className = "w-[12rem] text-xl lg:text-base font-bold uppercase lg:px-6 lg:py-4 whitespace-pre-wrap break-all text-black">
                  Tags
               </div>
               <div className = "w-[8rem] text-xl lg:text-base font-bold uppercase lg:px-6 lg:py-4 whitespace-pre-wrap break-all text-black">
                  Image
               </div>
               <div className = "w-[3rem] text-xl lg:text-base font-bold uppercase lg:px-6 lg:py-4 whitespace-pre-wrap break-all text-black">
               </div>
            </div>
            <div className = "flex flex-col gap-2 lg:gap-0 w-full mx-auto bg-white">
               {workouts.map((workout: Workout, index: number) => (
                  <Row
                     workout = {workout}
                     index = {index}
                     globalState = {globalState}
                     globalDispatch = {globalDispatch}
                     key = {workout.id}
                  />
               ))}
            </div>
            {visibleSelectedWorkouts.size > 0 && (
               <Conformation
                  message = {`Delete ${visibleSelectedWorkouts.size} workout${visibleSelectedWorkouts.size === 1 ? "" : "s"}?`}
                  onConformation = {() => handleWorkoutDelete()}
                  icon
               />
            )
            }
         </div>
      </div >
   );
}