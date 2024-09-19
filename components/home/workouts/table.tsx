import clsx from "clsx";
import PopUp from "@/components/global/popup";
import WorkoutCard from "@/components/home/workouts/card";
import { VitalityAction, VitalityState } from "@/lib/global/state";
import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { removeWorkouts, Tag, Workout } from "@/lib/workouts/workouts";
import { Dispatch, useMemo } from "react";

interface WorkoutRowProps {
   workout: Workout;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction>;
   reset: () => void;
}

function getWorkoutDate(date: Date) {
   const day = String(date.getDate()).padStart(2, '0');
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const year = date.getFullYear();

   return `${day}/${month}/${year}`;
}

function WorkoutRow(props: WorkoutRowProps) {
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

   return (
      <tr
         className="bg-white border-b hover:bg-gray-50 0"
         key={props.workout.id}>
         <td className="w-4 p-4">
            <div className="flex items-center">
               <input
                  type="checkbox"
                  className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  checked={props.state.inputs.workouts.data.selected.has(props.workout)}
                  onChange={() => handleToggle()}
               />
            </div>
         </td>
         <th scope="row" className="px-6 py-4 font-normal whitespace-nowrap overflow-hidden text-ellipsis max-w-[30rem]">
            {props.workout.title}
         </th>
         <td className="px-6 py-4 max-w-[15rem]">
            {formattedDate}
         </td>
         <td className="px-6 py-4 max-w-[50rem]">
            <div className="flex flex-wrap justify-start items-center gap-2">
               {
                  props.workout.tags.map((tag: Tag) => {
                     return (
                        <div
                           className={clsx("px-3 py-1 m-2 rounded-full text-sm font-bold text-white transition duration-300 ease-in-out")}
                           style={{
                              backgroundColor: tag.color
                           }}
                           key={tag.id}
                        >
                           {tag.title}
                        </div>
                     );
                  })
               }
            </div>
         </td>
         <td className="px-6 py-4 min-w-[10rem]">
            <div className="flex justify-start items-center gap-4">
               <PopUp
                  onClick={() => {
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
                              value: props.workout.date
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
                  cover={
                     <FontAwesomeIcon icon={faPencil} className="text-primary cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out" />
                  }
               >
                  <WorkoutCard {...props} reset={props.reset} />
               </PopUp>
               <FontAwesomeIcon 
                  icon={faTrashCan} 
                  className="text-red-500 cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out" 
                  onClick={async ()=> {
                     alert(`Are you sure you want to remove ${props.state.inputs.workouts.data.selected.size} workout${props.state.inputs.workouts.data.selected.size == 1 ? '' : 's'}?`);
                     await removeWorkouts(Array.from(props.state.inputs.workouts.data.selected));
                  }}
                  />
            </div>
         </td>
      </tr>
   );
}

interface WorkoutTableProps {
   workouts: Workout[];
   state: VitalityState;
   dispatch: Dispatch<VitalityAction>;
   reset: () => void;
}

export default function WorkoutTable(props: WorkoutTableProps): JSX.Element {
   const selected: Set<Workout> = props.state.inputs.workouts.data.selected;

   const handleToggle = useMemo(() => {
      return () => {
         if (selected.size === props.workouts.length) {
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
                     selected: new Set(props.workouts)
                  }
               }
            });
         }
      };
   }, [props, selected.size]);

   return (
      <div className="relative w-10/12 m-6 overflow-x-auto shadow-md sm:rounded-xl">
         <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs uppercase bg-gray-50">
               <tr>
                  <th scope="col" className="p-4">
                     <div className="flex items-center">
                        <input
                           type="checkbox"
                           checked={selected.size === props.workouts.length && selected.size !== 0}
                           className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                           onChange={() => handleToggle()}
                        />
                     </div>
                  </th>
                  <th scope="col" className="text-base px-6 py-8">
                     Title
                  </th>
                  <th scope="col" className="text-base px-6 py-8">
                     Date
                  </th>
                  <th scope="col" className="text-base px-6 py-8">
                     Tags
                  </th>
                  <th scope="col" className="text-base px-6 py-8">
                     Action
                  </th>
               </tr>
            </thead>
            <tbody>
               {props.workouts.map((workout: Workout) => (
                  <WorkoutRow workout={workout} state={props.state} dispatch={props.dispatch} key={workout.id} reset={props.reset} />
               ))}
            </tbody>
         </table>
      </div>
   );
}