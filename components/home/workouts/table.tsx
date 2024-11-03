import clsx from "clsx";
import Image from "next/image";
import Button from "@/components/global/button";
import { VitalityProps, VitalityResponse } from "@/lib/global/state";
import { faArrowRotateBack, faImage, faPencil, faSquareCheck, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { removeWorkouts, Workout } from "@/lib/workouts/workouts";
import { getWorkoutDate } from "@/lib/workouts/shared";
import { Tag } from "@/lib/workouts/tags";
import { useCallback, useContext, useMemo, useRef } from "react";
import { NotificationContext } from "@/app/layout";
import { Modal } from "@/components/global/modal";

interface WorkoutListingProps extends VitalityProps {
   workout: Workout;
   index: number;
}

function WorkoutListing(props: WorkoutListingProps) {
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
               className = {clsx("max-w-full px-3 py-1 m-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-full text-sm lg:text-xs font-bold text-white transition duration-300 ease-in-out")}
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
      <div
         id = {workout.id}
         className = "flex flex-col lg:flex-row justify-between items-center text-center w-full mx-auto bg-white lg:p-4 rounded-md lg:rounded-none">
         <div className = "w-full lg:w-[1rem] flex justify-center items-center text-base uppercase p-3 whitespace-normal py-6 lg:py-4 font-medium text-black">
            <input
               id = {`workout-select-${workout.id}`}
               type = "checkbox"
               className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
               checked = {globalState.workouts.data.selected.has(workout)}
               onChange = {() => handleWorkoutToggle()}
            />
         </div>
         <div className = "w-full max-w-[90%] lg:w-[10rem] text-xl lg:text-base font-medium uppercase lg:p-6 pb-2 lg:py-4 whitespace-pre-wrap break-all text-black">
            {workout.title}
         </div>
         <div className = "w-full lg:w-[10rem] text-lg lg:text-base font-medium uppercase lg:p-6 whitespace-normal py-0 lg:py-4 text-black">
            {formattedDate}
         </div>
         <div className = "w-full lg:w-[12rem] lg:max-h-[12rem] overflow-auto scrollbar-hide text-base lg:p-2 whitespace-normal py-4 font-medium text-black m:px-6">
            <div className = "flex flex-row flex-wrap justify-center items-center gap-2 p-2 cursor-all-scroll">
               {workoutTags}
            </div>
         </div>
         <div
            className = {clsx("relative order-first lg:order-none w-full h-[20rem] lg:w-[9rem] lg:h-[9rem] max-w-full text-base uppercase lg:p-6 whitespace-normal lg:py-4 font-medium text-black border-b-primary border-b-[4px] lg:border-none")}>
            {
               workout.image ? (
                  <Image
                     fill
                     priority
                     quality = {100}
                     sizes = "100%"
                     src = {workout.image}
                     alt = "workout-image"
                     className = {clsx("w-full h-full object-cover object-center rounded-sm lg:rounded-3xl cursor-pointer transition duration-300 ease-in-out")}
                  />
               ) : (
                  <div className = "w-full h-full lg:rounded-3xl flex justify-center items-center text-primary">
                     <FontAwesomeIcon
                        className = "text-3xl"
                        icon = {faImage} />
                  </div>
               )
            }
         </div>
         <div className = "w-full lg:w-[3rem] text-base whitespace-normal px-2 py-4 font-medium text-black text-center">
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
                  <div className = "hidden lg:block">
                     <FontAwesomeIcon
                        icon = {faPencil}
                        className = " text-primary cursor-pointer text-md hover:scale-125 transition duration-300 ease-in-out"
                     />
                  </div>
                  <div className = "block lg:hidden">
                     <Button
                        type = "button"
                        className = "block lg:hidden bg-primary text-white w-[10rem] mb-4 h-[2.6rem] p-4 text-sm"
                        icon = {faPencil}
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

interface WorkoutTableProps extends VitalityProps {
   workouts: Workout[];
}

export default function WorkoutTable(props: WorkoutTableProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { workouts, globalState, globalDispatch } = props;
   const selected: Set<Workout> = globalState.workouts.data.selected;
   const deleteModalRef = useRef<{ open: () => void, close: () => void }>(null);

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
      <div className = "relative w-full mx-auto">
         <div className = "my-6 overflow-hidden rounded-md shadow-md">
            <div className = "hidden lg:flex justify-between items-center w-full mx-auto bg-white p-4">
               <div className = "w-full lg:w-[1rem] flex justify-center items-center text-base uppercase p-3 whitespace-normal py-4 font-extrabold text-black">
                  <input
                     id = "workout-select-all"
                     type = "checkbox"
                     checked = {allVisibleSelected}
                     className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 `border-`gray-300 rounded focus:ring-blue-500"
                     onChange = {() => handleWorkoutToggle()}
                  />
               </div>
               <div className = "w-full lg:w-[10rem] text-base uppercase p-6 whitespace-normal py-4 font-extrabold text-black">
                  Title
               </div>
               <div className = "w-full lg:w-[10rem] text-base uppercase p-6 whitespace-normal py-4 font-extrabold text-black">
                  Date
               </div>
               <div className = "w-full lg:w-[12rem] text-base uppercase p-6 whitespace-normal py-4 font-extrabold text-black m:px-6">
                  Tags
               </div>
               <div className = "w-full lg:w-[10rem] text-base uppercase p-6 whitespace-normal py-4 font-extrabold text-black">
                  Image
               </div>
               <div className = "w-full lg:w-[3rem] text-base uppercase p-6 whitespace-normal py-4 font-extrabold text-black">
               </div>
            </div>
            <div className = "flex flex-col gap-4 lg:gap-0 w-full mx-auto bg-white">
               {workouts.map((workout: Workout, index: number) => (
                  <WorkoutListing
                     workout = {workout}
                     index = {index}
                     globalState = {globalState}
                     globalDispatch = {globalDispatch}
                     key = {workout.id} />
               ))}
            </div>
            {visibleSelectedWorkouts.size > 0 && (
               <Modal
                  ref = {deleteModalRef}
                  display = {
                     <div className = "w-full bg-white py-4">
                        <FontAwesomeIcon
                           className = "text-red-500 cursor-pointer text-xl hover:scale-125 transition duration-300 ease-in-out"
                           icon = {faTrashCan}
                        />
                     </div>
                  }
                  className = "max-w-xl"
               >
                  <div className = "flex flex-col justify-between items-center gap-4 p-2">
                     <FontAwesomeIcon
                        icon = {faTrashCan}
                        className = "text-red-500 text-3xl" />
                     <p className = "font-bold">
                        {
                           `Delete ${visibleSelectedWorkouts.size} workout${visibleSelectedWorkouts.size === 1 ? "" : "s"}?`
                        }
                     </p>
                     <div className = "flex flex-row flex-wrap justify-center items-center gap-2">
                        <Button
                           type = "button"
                           icon = {faArrowRotateBack}
                           className = "w-[10rem] bg-gray-100 text-black px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-blue-500 focus:ring-blue-500 hover:scale-105 transition duration-300 ease-in-out"
                           onClick = {() => {
                              // Close the modal for deletion confirmation
                              if (deleteModalRef.current) {
                                 deleteModalRef.current.close();
                              }
                           }}
                        >
                           No, cancel
                        </Button>
                        <Button
                           type = "button"
                           icon = {faSquareCheck}
                           className = "w-[10rem] bg-red-500 text-white px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-red-300 focus:ring-red-300 hover:scale-105 transition duration-300 ease-in-out"
                           onClick = {async() => handleWorkoutDelete()}
                        >
                           Yes, I&apos;m sure
                        </Button>
                     </div>
                  </div>
               </Modal>
            )
            }
         </div>
      </div >
   );
}