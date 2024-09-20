import clsx from "clsx";
import Image from "next/image";
import PopUp from "@/components/global/popup";
import Button from "@/components/global/button";
import WorkoutForm from "@/components/home/workouts/form";
import { VitalityAction, VitalityResponse, VitalityState } from "@/lib/global/state";
import { faPencil, faPersonRunning, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { removeWorkouts, Tag, Workout } from "@/lib/workouts/workouts";
import { Dispatch, useContext, useMemo } from "react";
import { NotificationContext } from "@/app/layout";

interface WorkoutRowProps {
   workout: Workout;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout>>;
   reset: () => void;
}

function getWorkoutDate(date: Date) {
   const day = String(date.getDate()).padStart(2, "0");
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const year = date.getFullYear();

   return `${day}/${month}/${year}`;
}

function WorkoutRow(props: WorkoutRowProps) {
   const { workout, state, dispatch, reset } = props;
   const { updateNotification } = useContext(NotificationContext);
   const selected: Set<Workout> = state.inputs.workouts.data.selected;
   const formattedDate = useMemo(() => getWorkoutDate(new Date(workout.date)), [workout.date]);

   const handleToggle = useMemo(() => {
      return () => {
         // Either add or remove from selected
         const newSelected: Set<Workout> = new Set(selected);

         if (newSelected.has(workout)) {
            newSelected.delete(workout);
         } else {
            newSelected.add(workout);
         }

         dispatch({
            type: "updateInput",
            value: {
               ...state.inputs.workouts,
               data: {
                  ...state.inputs.workouts.data,
                  selected: newSelected
               }
            }
         });
      };
   }, [state.inputs.workouts, workout, selected, dispatch]);

   const handleDelete = useMemo(async() => {
      return async() => {
         // Remove the current or selected set of workout's
         const size = selected.size == 0 ? 1 : selected.size;

         const response: VitalityResponse<number> =
            size == 1 ? await removeWorkouts([workout]) : await removeWorkouts(Array.from(selected));

         if (response.body.data === size) {
            // Clear selected and filter workouts list
            const newWorkouts = [...state.inputs.workouts.value].filter((workout) => {
               // Remove single or multiple workouts
               return selected.size == 1 ? workout.id !== workout.id : !(selected.has(workout));
            });

            dispatch({
               type: "updateState",
               value: {
                  ...state,
                  inputs: {
                     ...state.inputs,
                     workouts: {
                        ...state.inputs.workouts,
                        value: newWorkouts,
                        data: {
                           ...state.inputs.workouts.data,
                           // Clear selected workouts
                           selected: new Set<Workout>()
                        }
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
      };
   }, [selected, workout, updateNotification, state, dispatch]);

   return (
      <tr
         className = "bg-white border-b hover:bg-gray-50 overflow-x-auto"
         key = {workout.id}>
         <td className = "w-4 p-4">
            <div className = "flex items-center">
               <input
                  type = "checkbox"
                  className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  checked = {state.inputs.workouts.data.selected.has(workout)}
                  onChange = {() => handleToggle()}
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
            <div className = "flex flex-wrap justify-start items-center gap-2 max-w-[10rem]">
               {
                  workout.tags.map((tag: Tag) => {
                     return (
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
                  })
               }
            </div>
         </td>
         <th scope = "row" className = "w-[10rem] h-[10rem] font-normal whitespace-nowrap overflow-hidden text-ellipsis">
            {
               workout.image ? (
                  <Image
                     width = {1000}
                     height = {1000}
                     src = {workout.image}
                     alt = "workout-image"
                     className = {clsx(" object-cover object-center rounded-2xl cursor-pointer transition duration-300 ease-in-out")}
                  />
               ) : (
                  <div className = "rounded-2xl flex justify-center items-center">
                     <FontAwesomeIcon icon = {faPersonRunning} className = "text-primary cursor-pointer text-3xl" />
                  </div>

               )
            }

         </th>
         <td className = "px-6 py-4 min-w-[10rem]">
            <div className = "flex justify-end pr-12 items-center gap-4">
               <PopUp
                  onClick = {() => {
                     // Update input states based on current workout
                     dispatch({
                        type: "initializeState",
                        value: {
                           title: {
                              ...state.inputs.title,
                              value: workout.title
                           },
                           date: {
                              ...state.inputs.date,
                              // Convert to form MM-DD-YYYY for input value
                              value: workout.date.toISOString().split("T")[0]
                           },
                           image: {
                              ...state.inputs.image,
                              value: workout.image
                           },
                           description: {
                              ...state.inputs.description,
                              value: workout.description
                           },
                           tags: {
                              ...state.inputs.tags,
                              data: {
                                 ...state.inputs.tags.data,
                                 // Display all selected tags, if any
                                 selected: workout.tags
                              }
                           }
                        }
                     });
                  }}
                  cover = {
                     <FontAwesomeIcon icon = {faPencil} className = "text-primary cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out" />
                  }
               >
                  <WorkoutForm {...props} reset = {reset} />
               </PopUp>
               <PopUp
                  cover = {
                     <FontAwesomeIcon
                        icon = {faTrashCan}
                        className = "text-red-500 cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out"
                     />
                  }
               >
                  <div className = "flex flex-col justify-center items-center gap-4">
                     <FontAwesomeIcon icon = {faTrashCan} className = "text-red-500 text-4xl" />
                     <p className = "font-bold">
                        {

                           selected.size === 0 ?
                              "Are you sure you want to delete this item?"
                              :
                              `Are you sure you want to delete ${selected.size} workout${selected.size === 1 ? "" : "s"}?`
                        }
                     </p>
                     <div className = "flex flex-row justify-center items-center gap-4 flex-1">
                        <Button type = "button" className = "w-[10rem] bg-gray-100 text-black mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] min-h-[2.7rem] focus:border-blue-500 focus:ring-blue-500 hover:scale-105 transition duration-300 ease-in-out">
                           No, cancel
                        </Button>
                        <Button type = "button" onClick = {async() => {
                           (await handleDelete)();
                        }} className = "w-[10rem] bg-red-500 text-white mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] min-h-[2.7rem] focus:border-red-300 focus:ring-red-300 hover:scale-105 transition duration-300 ease-in-out">
                           Yes, I&apos;m sure
                        </Button>
                     </div>
                  </div>
               </PopUp>
            </div>
         </td>
      </tr>
   );
}

interface WorkoutTableProps {
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout>>;
   reset: () => void;
}

export default function WorkoutTable(props: WorkoutTableProps): JSX.Element {
   const { state, dispatch, reset } = props;
   const selected: Set<Workout> = state.inputs.workouts.data.selected;
   const workouts: Workout[] = state.inputs.workouts.value;

   const handleToggle = useMemo(() => {
      return () => {
         if (selected.size === workouts.length) {
            // Select no workouts
            dispatch({
               type: "updateInput",
               value: {
                  ...state.inputs.workouts,
                  data: {
                     ...state.inputs.workouts.data,
                     selected: new Set<Workout>()
                  }
               }
            });
         } else {
            // Select all workouts
            dispatch({
               type: "updateInput",
               value: {
                  ...state.inputs.workouts,
                  data: {
                     ...state.inputs.workouts.data,
                     selected: new Set(workouts)
                  }
               }
            });
         }
      };
   }, [state.inputs.workouts, workouts, selected.size, dispatch]);

   return (
      <div className = "relative w-10/12 m-6 overflow-x-auto shadow-md sm:rounded-xl">
         <table className = "w-full text-sm text-left rtl:text-right">
            <thead className = "text-xs uppercase bg-gray-50">
               <tr>
                  <th scope = "col" className = "p-4">
                     <div className = "flex items-center">
                        <input
                           type = "checkbox"
                           checked = {selected.size === workouts.length && selected.size !== 0}
                           className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                           onChange = {() => handleToggle()}
                        />
                     </div>
                  </th>
                  <th scope = "col" className = "text-base px-8 py-12">
                     Title
                  </th>
                  <th scope = "col" className = "text-base px-8 py-12">
                     Date
                  </th>
                  <th scope = "col" className = "text-base px-8 py-12">
                     Tags
                  </th>
                  <th scope = "col" className = "text-base px-8 py-12">
                     Image
                  </th>
                  <th scope = "col" className = "text-base px-8 py-12">
                  </th>
               </tr>
            </thead>
            <tbody>
               {workouts.map((workout: Workout) => (
                  <WorkoutRow workout = {workout} state = {state} dispatch = {dispatch} key = {workout.id} reset = {reset} />
               ))}
            </tbody>
         </table>
      </div>
   );
}