import clsx from "clsx";
import PopUp from "@/components/global/popup";
import Button from "@/components/global/button";
import WorkoutCard from "@/components/home/workouts/card";
import { VitalityAction, VitalityResponse, VitalityState } from "@/lib/global/state";
import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";
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
   const { updateNotification } = useContext(NotificationContext);
   const selected: Set<Workout> = props.state.inputs.workouts.data.selected;
   const formattedDate = useMemo(() => getWorkoutDate(new Date(props.workout.date)), [props.workout.date]);

   const handleToggle = useMemo(() => {
      return () => {
         // Either add or remove from selected
         const newSelected: Set<Workout> = new Set(selected);

         if (newSelected.has(props.workout)) {
            newSelected.delete(props.workout);
         } else {
            newSelected.add(props.workout);
         }

         props.dispatch({
            type: "updateInput",
            value: {
               ...props.state.inputs.workouts,
               data: {
                  ...props.state.inputs.workouts.data,
                  selected: newSelected
               }
            }
         });
      };
   }, [props, selected]);

   const handleDelete = useMemo(async() => {
      return async () => {
         // Remove the current or selected set of workout's
            const response: VitalityResponse<number> = selected.size === 0
            ? await removeWorkouts([props.workout]) : await removeWorkouts(Array.from(selected));

         // Display the success or failure notification to the user
         updateNotification({
            status: response.status,
            message: response.body.message
         });
      }
   }, [selected, props.workout, updateNotification]);

   return (
      <tr
         className = "bg-white border-b hover:bg-gray-50 0"
         key = {props.workout.id}>
         <td className = "w-4 p-4">
            <div className = "flex items-center">
               <input
                  type = "checkbox"
                  className = "cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  checked = {props.state.inputs.workouts.data.selected.has(props.workout)}
                  onChange = {() => handleToggle()}
               />
            </div>
         </td>
         <th scope = "row" className = "px-6 py-4 font-normal whitespace-nowrap overflow-hidden text-ellipsis max-w-[30rem]">
            {props.workout.title}
         </th>
         <td className = "px-6 py-4 max-w-[15rem]">
            {formattedDate}
         </td>
         <td className = "px-6 py-4 max-w-[50rem]">
            <div className = "flex flex-wrap justify-start items-center gap-2">
               {
                  props.workout.tags.map((tag: Tag) => {
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
         <td className = "px-6 py-4 min-w-[10rem]">
            <div className = "flex justify-start items-center gap-4">
               <PopUp
                  onClick = {() => {
                     // Update input states based on current workout
                     props.dispatch({
                        type: "initializeState",
                        value: {
                           title: {
                              ...props.state.inputs.title,
                              value: props.workout.title
                           },
                           date: {
                              ...props.state.inputs.date,
                              // Convert to form MM-DD-YYYY for input value
                              value: props.workout.date.toISOString().split("T")[0]
                           },
                           image: {
                              ...props.state.inputs.image,
                              value: props.workout.image
                           },
                           description: {
                              ...props.state.inputs.description,
                              value: props.workout.description
                           },
                           tags: {
                              ...props.state.inputs.tags,
                              data: {
                                 ...props.state.inputs.tags.data,
                                 // Display all selected tags, if any
                                 selected: props.workout.tags
                              }
                           }
                        }
                     });
                  }}
                  cover = {
                     <FontAwesomeIcon icon = {faPencil} className = "text-primary cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out" />
                  }
               >
                  <WorkoutCard {...props} reset = {props.reset} />
               </PopUp>
               <PopUp
                  className = "max-w-[40rem]"
                  cover = {
                     <FontAwesomeIcon
                        icon = {faTrashCan}
                        className = "text-red-500 cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out"
                     />
                  }
               >
                  <div className = "flex flex-col justify-center items-center gap-4">
                     <FontAwesomeIcon icon = {faTrashCan} className = "text-red-500 text-4xl"/>
                     <p className = "font-bold">
                        {

                           selected.size === 0 ?
                              "Are you sure you want to delete this item?"
                              : `Are you sure you want to delete ${selected.size} workout${selected.size === 1 ? "" : "s"}?`
                        }
                     </p>
                     <div className = "flex flex-row justify-center items-center gap-4 flex-1">
                        <Button type = "button" className = "w-[10rem] bg-gray-100 text-black mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] min-h-[2.7rem] focus:border-blue-500 focus:ring-blue-500 hover:scale-105 transition duration-300 ease-in-out">
                           No, cancel
                        </Button>
                        <Button type = "button" onClick = {() => handleDelete} className = "w-[10rem] bg-red-500 text-white mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] min-h-[2.7rem] focus:border-red-300 focus:ring-red-300 hover:scale-105 transition duration-300 ease-in-out">
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
   const selected: Set<Workout> = props.state.inputs.workouts.data.selected;
   const workouts: Workout[] = props.state.inputs.workouts.value;

   const handleToggle = useMemo(() => {
      return () => {
         if (selected.size === workouts.length) {
            // Select no workouts
            props.dispatch({
               type: "updateInput",
               value: {
                  ...props.state.inputs.workouts,
                  data: {
                     ...props.state.inputs.workouts.data,
                     selected: new Set<Workout>()
                  }
               }
            });
         } else {
            // Select all workouts
            props.dispatch({
               type: "updateInput",
               value: {
                  ...props.state.inputs.workouts,
                  data: {
                     ...props.state.inputs.workouts.data,
                     selected: new Set(workouts)
                  }
               }
            });
         }
      };
   }, [props, workouts, selected.size]);

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
                  <th scope = "col" className = "text-base px-6 py-8">
                     Title
                  </th>
                  <th scope = "col" className = "text-base px-6 py-8">
                     Date
                  </th>
                  <th scope = "col" className = "text-base px-6 py-8">
                     Tags
                  </th>
                  <th scope = "col" className = "text-base px-6 py-8">
                     Action
                  </th>
               </tr>
            </thead>
            <tbody>
               {workouts.map((workout: Workout) => (
                  <WorkoutRow workout = {workout} state = {props.state} dispatch = {props.dispatch} key = {workout.id} reset = {props.reset} />
               ))}
            </tbody>
         </table>
      </div>
   );
}