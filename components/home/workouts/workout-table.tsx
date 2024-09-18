import clsx from "clsx";
import PopUp from "@/components/global/popup";
import WorkoutCard from "@/components/home/workouts/workout-card";
import { VitalityAction, VitalityState } from "@/lib/global/form";
import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tag, Workout } from "@/lib/workouts/workouts";
import { Dispatch } from "react";

interface WorkoutRowProps {
   workout: Workout;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction>;
}

function WorkoutRow(props: WorkoutRowProps) {
   return (
      <tr
         className="bg-white border-b hover:bg-gray-50 0"
         key={props.workout.id}>
         <td className="w-4 p-4">
            <div className="flex items-center">
               <input id="checkbox-table-search-1" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
               <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>
            </div>
         </td>
         <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[5rem]">
            {props.workout.title}
         </th>
         <td className="px-6 py-4">
            {props.workout.date.toString()}
         </td>
         <td className="px-6 py-4">
            <div className="flex flex-wrap justify-center items-center gap-2">
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
         <td className="px-6 py-4">
            <div className="flex justify-start items-center gap-4">
               <PopUp
                  onClick={() => {
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
                     <FontAwesomeIcon icon={faPencil} className="text-primary cursor-pointer text-md hover:scale-125 transition duration-300 ease-in-out" />
                  }
               >
                  { WorkoutCard(props.workout, props.state, props.dispatch)}
               </PopUp>
               <FontAwesomeIcon icon={faTrashCan} className="text-red-500 cursor-pointer text-md hover:scale-125 transition duration-300 ease-in-out" />
            </div>
         </td>
      </tr>
   );
}

interface WorkoutTableProps {
   workouts: Workout[];
   state: VitalityState;
   dispatch: Dispatch<VitalityAction>;
}

export default function WorkoutTable(props: WorkoutTableProps): JSX.Element {
   return (
      <div className="relative w-10/12 m-6 overflow-x-auto shadow-md sm:rounded-lg">
         <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs uppercase bg-gray-50">
               <tr>
                  <th scope="col" className="p-4">
                     <div className="flex items-center">
                        <input id="checkbox-all-search" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                     </div>
                  </th>
                  <th scope="col" className="px-6 py-3">
                     Title
                  </th>
                  <th scope="col" className="px-6 py-3">
                     Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                     Tags
                  </th>
                  <th scope="col" className="px-6 py-3">
                     Action
                  </th>
               </tr>
            </thead>
            <tbody>
               {props.workouts.map((workout: Workout) => (
                  <WorkoutRow workout={workout} state={props.state} dispatch={props.dispatch} />
               ))}
            </tbody>
         </table>
      </div>
   );
}