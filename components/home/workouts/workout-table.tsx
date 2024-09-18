import clsx from "clsx"
import PopUp from "@/components/global/popup"
import WorkoutCard from "@/components/home/workouts/workout-card"
import { FormAction, FormState } from "@/lib/global/form"
import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tag, Workout } from "@/lib/workouts/workouts"
import { Dispatch } from "react"

function WorkoutRow(props: Workout, state: FormState, dispatch: Dispatch<FormAction>) {
   return (
      <tr 
         className="bg-white border-b hover:bg-gray-50 0"
         key={props.id}>
         <td className="w-4 p-4">
            <div className="flex items-center">
               <input id="checkbox-table-search-1" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
               <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>
            </div>
         </td>
         <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[5rem]">
            {props.title}
         </th>
         <td className="px-6 py-4">
            { props.date.toString() }
         </td>
         <td className="px-6 py-4">
            <div className="flex flex-wrap justify-center items-center gap-2">
               {
                  props.tags.map((tag: Tag) => {
                     return (
                        <div
                           className={clsx("px-3 py-1 m-2 rounded-full text-sm font-bold text-white transition duration-300 ease-in-out")}
                           style={{
                              backgroundColor: tag.color
                           }}
                           key={tag.id}
                        >
                           { tag.title }
                        </div>
                     )
                  })
               }
            </div>
         </td>
         <td className="px-6 py-4">
            <div className="flex justify-start items-center gap-2">
               <PopUp
                  onClick={() => {
                     dispatch({
                        type: "initializeInputs",
                        value: {
                           title: {
                              ...state.inputs.title,
                              value: props.title
                           },
                           date: {
                              ...state.inputs.date,
                              value: props.date
                           },
                           image: {
                              ...state.inputs.image,
                              value: props.image
                           },
                           description: {
                              ...state.inputs.description,
                              value: props.description
                           },
                           tags: {
                              ...state.inputs.tags,
                              data: {
                                 ...state.inputs.tags.data,
                                 // Display all selected tags, if any
                                 selected: props.tags
                              }
                           }
                        }
                     });
                  }}
                  cover={
                     <FontAwesomeIcon icon={faPencil} className="text-primary cursor-pointer text-md hover:scale-125 transition duration-300 ease-in-out" />
                  }
               >
                  { WorkoutCard(props, state, dispatch) }
               </PopUp>
               <FontAwesomeIcon icon={faTrashCan} className="text-red-500 cursor-pointer text-md hover:scale-125 transition duration-300 ease-in-out" />
            </div>
         </td>
      </tr>
   );
}


export default function WorkoutTable(workouts: Workout[], state: FormState, dispatch: Dispatch<FormAction>): JSX.Element {
   const workout: Workout = {
      id: "asdasd",
      user_id: "",
      tags: [],
      title: "AAAASSSSSsaasd",
      date: new Date(new Date().getTime() - 1000),
      image: "",
      description: "HELLO"
   }

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
               {
                  workouts.map((workout: Workout) => {
                     return WorkoutRow(workout, state, dispatch);
                  })
               }
            </tbody>
         </table>
      </div>
   )
}