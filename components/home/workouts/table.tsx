import clsx from "clsx";
import Image from "next/image";
import Button from "@/components/global/button";
import WorkoutForm from "@/components/home/workouts/form";
import Loading from "@/components/global/loading";
import { VitalityProps, VitalityResponse } from "@/lib/global/state";
import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";
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
   const { updateNotification } = useContext(NotificationContext);
   const deletePopUpRef = useRef<{ close: () => void }>(null);
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

   const handleWorkoutDelete = useCallback(async() => {
      // Remove the current or selected set of workout's
      const size = selected.size == 0 ? 1 : selected.size;

      const response: VitalityResponse<number> =
         size == 1 ? await removeWorkouts([workout]) : await removeWorkouts(Array.from(selected));

      if (response.body.data === size) {
         // Clear selected and filter workouts list
         const newWorkouts = [...globalState.workouts.value].filter((w: Workout) => {
            // Remove single or multiple workouts
            return size == 1 ? workout.id !== w.id : !(selected.has(w));
         });

         const newFiltered = [...globalState.workouts.data.filtered].filter((w: Workout) => {
            // Remove single or multiple workouts
            return size == 1 ? workout.id !== w.id : !(selected.has(w));
         });

         globalDispatch({
            type: "updateStates",
            value: {
               ...globalState,
               workouts: {
                  ...globalState.workouts,
                  value: newWorkouts,
                  data: {
                     ...globalState.workouts.data,
                     // Clear selected workouts
                     filtered: newFiltered,
                     selected: new Set<Workout>()
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

   }, [globalDispatch, selected, globalState, updateNotification, workout]);

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
      <tr
         className = "bg-white border-b hover:bg-gray-50 overflow-x-auto"
         key = {workout.id}>
         <td className = "w-4 p-4">
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
         <th scope = "row" className = "px-6 py-4 font-normal whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]">
            {workout.title}
         </th>
         <td className = "px-6 py-4">
            {formattedDate}
         </td>
         <td className = "px-6 py-4">
            <div className = "flex flex-row flex-wrap justify-start items-center gap-2 max-w-[30rem]">
               {workoutTags}
            </div>
         </td>
         <th scope = "row" className = "w-[8rem] h-[8rem] p-3 font-normal whitespace-nowrap overflow-hidden text-ellipsis">
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
                  <div className = "w-full h-full rounded-2xl flex justify-center items-center bg-primary" />
               )
            }
         </th>
         <td className = "px-6 py-4 min-w-[10rem]">
            <div className = "flex justify-end pr-12 items-center gap-4">
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
                                 id : "workout",
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
               {
                  <PopUp
                     className = "max-w-xl"
                     ref = {deletePopUpRef}
                     cover = {
                        <FontAwesomeIcon
                           className = "text-red-500 cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out"
                           icon = {faTrashCan}
                        />
                     }
                  >
                     <div className = "flex flex-col justify-center items-center gap-4">
                        <FontAwesomeIcon icon = {faTrashCan} className = "text-red-500 text-4xl" />
                        <p className = "font-bold">
                           {

                              selected.size === 0 ?
                                 "Are you sure you want to delete this workout?"
                                 :
                                 `Are you sure you want to delete ${selected.size} workout${selected.size === 1 ? "" : "s"}?`
                           }
                        </p>
                        <div className = "flex flex-row justify-center items-center gap-4 flex-1">
                           <Button
                              type = "button"
                              className = "w-[10rem] bg-gray-100 text-black mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] min-h-[2.7rem] focus:border-blue-500 focus:ring-blue-500 hover:scale-105 transition duration-300 ease-in-out"
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
                              className = "w-[10rem] bg-red-500 text-white mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] min-h-[2.7rem] focus:border-red-300 focus:ring-red-300 hover:scale-105 transition duration-300 ease-in-out"
                              onClick = {async() => handleWorkoutDelete()}
                           >
                              Yes, I&apos;m sure
                           </Button>
                        </div>
                     </div>
                  </PopUp>
               }
            </div>
         </td>
      </tr>
   );
}

interface WorkoutTableProps extends VitalityProps {
   workouts: Workout[];
}

export default function WorkoutTable(props: WorkoutTableProps): JSX.Element {
   const { workouts, globalState, globalDispatch } = props;
   const selected: Set<Workout> = globalState.workouts.data.selected;
   const fetched: boolean = globalState.workouts.data.fetched;

   // Visible workouts that have been selected
   const visible = useMemo(() => {
      return new Set<Workout>(workouts.filter(workout => selected.has(workout)));
   }, [workouts, selected]);

   // Check if all visible workouts are selected
   const allVisibleSelected: boolean = workouts.length > 0 && workouts.every(workout => selected.has(workout));

   // Function to update selected workouts in the globalState
   const handleUpdateSelectedWorkouts = useCallback((newSelected: Set<Workout>) => {
      globalDispatch({
         type: "updateState",
         value: {
            id : "workouts",
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
            handleUpdateSelectedWorkouts(new Set([...Array.from(selected)].filter(workout => !visible.has(workout))));
         } else {
            // Select all visible workouts
            handleUpdateSelectedWorkouts(new Set([...Array.from(selected), ...workouts]));
         }
      };
   }, [allVisibleSelected, handleUpdateSelectedWorkouts, workouts, selected, visible]);

   return (
      <div className = "relative w-full">
         {
            workouts.length > 0 ? (
               <div className = "w-10/12 mx-auto overflow-x-auto mt-6 rounded-xl shadow-xl">
                  <table className = "w-full text-sm text-left rtl:text-right">
                     <thead className = "text-xs uppercase bg-gray-50">
                        <tr>
                           <th scope = "col" className = "p-4">
                              <div className = "flex items-center">
                                 <input
                                    id = "workout-select-all"
                                    type = "checkbox"
                                    checked = {allVisibleSelected}
                                    className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    onChange = {() => handleWorkoutToggle()}
                                 />
                              </div>
                           </th>
                           <th scope = "col" className = "text-base p-6">
                              Title
                           </th>
                           <th scope = "col" className = "text-base p-6">
                              Date
                           </th>
                           <th scope = "col" className = "text-base p-6">
                              Tags
                           </th>
                           <th scope = "col" className = "text-base text-center p-6">
                              Image
                           </th>
                           <th scope = "col" className = "text-base p-6">
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {workouts.map((workout: Workout) => (
                           <WorkoutRow workout = {workout} globalState = {globalState} globalDispatch = {globalDispatch} key = {workout.id} />
                        ))}
                     </tbody>
                  </table>
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