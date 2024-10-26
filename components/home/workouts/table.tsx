import clsx from "clsx";
import Image from "next/image";
import Button from "@/components/global/button";
import WorkoutForm from "@/components/home/workouts/form";
import Loading from "@/components/global/loading";
import { VitalityProps, VitalityResponse } from "@/lib/global/state";
import { faArrowRotateBack, faImage, faPencil, faQuestion, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { removeWorkouts, Workout } from "@/lib/workouts/workouts";
import { getWorkoutDate } from "@/lib/workouts/shared";
import { Tag } from "@/lib/workouts/tags";
import { useCallback, useContext, useMemo, useRef } from "react";
import { NotificationContext } from "@/app/layout";
import { PopUp } from "@/components/global/popup";

interface WorkoutRowProps extends VitalityProps {
   workout: Workout;
}

function WorkoutRow(props: WorkoutRowProps) {
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
               className = {clsx("px-3 py-1 m-2 rounded-full text-sm font-bold text-white transition duration-300 ease-in-out")}
               style = {{
                  backgroundColor: tag.color
               }}
               key = {tag.id}
            >
               {tag.title}
            </div>
         );
      });
   }, [workout, globalState.tags.data.dictionary]);

   return (
      <tr key = {workout.id}>
         <td className = "whitespace-no-wrap py-4 text-sm font-normal text-gray-500 sm:px-6 lg:table-cell">
            <div className = "flex items-center">
               <input
                  id = {`workout-select-${workout.id}`}
                  type = "checkbox"
                  className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  checked = {globalState.workouts.data.selected.has(workout)}
                  onChange = {() => handleWorkoutToggle()}
               />
            </div>
         </td>
         <td
            scope = "row"
            className = "px-6 py-4 font-normal whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]">
            {workout.title}
         </td>
         <td
            scope = "row"
            className = "px-6 py-4">
            {formattedDate}
         </td>
         <td
            scope = "row"
            className = "px-6 py-4">
            <div className = "flex flex-row flex-wrap justify-start items-center gap-2 max-w-[15rem]">
               {workoutTags}
            </div>
         </td>
         <td
            scope = "row"
            className = "w-[10rem] h-[10rem] p-3 font-normal whitespace-nowrap overflow-hidden text-ellipsis">
            {
               workout.image ? (
                  <Image
                     width = {1000}
                     height = {1000}
                     quality = {100}
                     src = {workout.image}
                     alt = "workout-image"
                     className = {clsx("w-full h-full object-cover object-center rounded-2xl cursor-pointer transition duration-300 ease-in-out")}
                  />
               ) : (
                  <div className = "w-full h-full rounded-2xl flex justify-center items-center text-primary">
                     <FontAwesomeIcon
                        className = "text-3xl"
                        icon = {faImage} />
                  </div>
               )
            }
         </td>
         <td
            scope = "row"
            className = "px-6 py-4 min-w-[10rem] text-center">
            <div className = "flex justify-center items-center gap-4">
               <WorkoutForm
                  {...props}
                  cover = {(
                     <FontAwesomeIcon
                        icon = {faPencil}
                        className = "text-primary cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out"
                        onClick = {() => {
                           globalDispatch({
                              type: "updateState",
                              value: {
                                 id: "workout",
                                 input: {
                                    ...globalState.workout,
                                    value: workout
                                 }
                              }
                           });
                        }}
                     />
                  )}
               />
            </div>
         </td>
      </tr>
   );
}

interface WorkoutTableProps extends VitalityProps {
   workouts: Workout[];
}

export default function WorkoutTable(props: WorkoutTableProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { workouts, globalState, globalDispatch } = props;
   const selected: Set<Workout> = globalState.workouts.data.selected;
   const fetched: boolean = globalState.workouts.data.fetched;
   const deletePopUpRef = useRef<{ close: () => void }>(null);

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
               }
            }
         });
      }

      // Display the success or failure notification to the user
      updateNotification({
         status: response.status,
         message: response.body.message
      });

   }, [globalDispatch, selected, globalState, updateNotification, visibleSelectedWorkouts]);

   return (
      <div className = "relative w-full min-h-full">
         {
            workouts.length > 0 ? (
               <div className = "mx-auto mt-6 overflow-hidden rounded-xl border shadow-xl">
                  <table className = "w-full mx-auto border-separate border-spacing-y-2 border-spacing-x-2 bg-white">
                     <thead className = "border-b hidden lg:table-header-group font-extrabold">
                        <tr>
                           <th
                              scope = "col"
                              className = "whitespace-normal py-4 text-base font-extrabold text-black sm:px-6">
                              <div className = "relative flex items-center">
                                 <input
                                    id = "workout-select-all"
                                    type = "checkbox"
                                    checked = {allVisibleSelected}
                                    className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    onChange = {() => handleWorkoutToggle()}
                                 />
                              </div>
                           </th>
                           <th
                              scope = "col"
                              className = "text-base uppercase p-6 whitespace-normal py-4 font-extrabold text-black sm:px-6">
                              Title
                           </th>
                           <th
                              scope = "col"
                              className = "text-base uppercase p-6 whitespace-normal py-4 font-extrabold text-black sm:px-6">
                              Date
                           </th>
                           <th
                              scope = "col"
                              className = "text-base uppercase p-6 whitespace-normal py-4 font-extrabold text-black m:px-6">
                              Tags
                           </th>
                           <th
                              scope = "col"
                              className = "text-base uppercase p-6 whitespace-normal py-4 font-extrabold text-black sm:px-6">
                              Image
                           </th>
                           <th
                              scope = "col"
                              className = "text-center uppercase p-6">
                              Action
                           </th>
                        </tr>
                     </thead>
                     <tbody className = "lg:border-gray-300">
                        {workouts.map((workout: Workout) => (
                           <WorkoutRow
                              workout = {workout}
                              globalState = {globalState}
                              globalDispatch = {globalDispatch}
                              key = {workout.id} />
                        ))}
                     </tbody>
                  </table>
                  {visibleSelectedWorkouts.size > 0 && (
                     <PopUp
                        className = "max-w-md"
                        ref = {deletePopUpRef}
                        cover = {
                           <div className = "w-full bg-white py-2">
                              <FontAwesomeIcon
                                 className = "text-red-500 cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out"
                                 icon = {faTrashCan}
                              />
                           </div>
                        }
                     >
                        <div className = "flex flex-col justify-center items-center gap-4 font-medium ">
                           <FontAwesomeIcon
                              icon = {faTrashCan}
                              className = "text-red-500 text-3xl" />
                           <p className = "font-bold text-md">
                              {
                                 `Are you sure you want to delete ${visibleSelectedWorkouts.size} workout${visibleSelectedWorkouts.size === 1 ? "" : "s"}?`
                              }
                           </p>
                           <div className = "flex flex-col flex-wrap justify-center items-center gap-2 flex-1">
                              <Button
                                 type = "button"
                                 icon = {faArrowRotateBack}
                                 className = "w-[10rem] bg-gray-100 text-black px-4 py-2 font-semibold border-gray-100 border-[1.5px] min-h-[2.7rem] focus:border-blue-500 focus:ring-blue-500 hover:scale-105 transition duration-300 ease-in-out"
                                 onClick = {() => {
                                    // Close the popup for deletion confirmation
                                    if (deletePopUpRef.current) {
                                       deletePopUpRef.current.close();
                                    }
                                 }}
                              >
                                 No, cancel
                              </Button>
                              <Button
                                 type = "button"
                                 icon = {faTrashCan}
                                 className = "w-[10rem] bg-red-500 text-white px-4 py-2 font-semibold border-gray-100 border-[1.5px] min-h-[2.7rem] focus:border-red-300 focus:ring-red-300 hover:scale-105 transition duration-300 ease-in-out"
                                 onClick = {async() => handleWorkoutDelete()}
                              >
                                 Yes, I&apos;m sure
                              </Button>
                           </div>
                        </div>
                     </PopUp>
                  )
                  }
               </div>
            ) : (
               <div className = "w-screen h-[15rem] mx-auto text-center flex justify-center items-center">
                  {fetched ? <h1 className = "font-bold text-xl">No available workouts</h1> : <Loading />}
               </div>
            )
         }
      </div>
   );
}