import Button from "@/components/global/button";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import ImageSelection from "@/components/home/workouts/image-selection";
import { TagSelection, WorkoutTag } from "@/components/home/workouts/tag-selection";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { VitalityAction, VitalityResponse, VitalityState } from "@/lib/global/state";
import { addWorkout, editWorkout, Tag, Workout } from "@/lib/workouts/workouts";
import { faArrowRotateLeft, faPersonRunning, faSquarePlus, faCloudArrowUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, useCallback, useContext, useState } from "react";

interface WorkoutFormProps {
   workout: Workout | undefined;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout>>;
   reset: () => void;
}

export default function WorkoutForm(props: WorkoutFormProps): JSX.Element {
   const { workout, state, dispatch, reset } = props;
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);

   // Upon creating a new workout, ensure we can edit it
   const [edit, setEdit] = useState<boolean>(workout !== undefined);

   const handleSubmission = async(event: React.MouseEvent<HTMLButtonElement>, method: "update" | "delete") => {
      event.stopPropagation();

      if (user !== undefined) {
         const { selected, dictionary } = state.inputs.tags.data;

         const payload: Workout = {
            user_id: user.id,
            id: workout !== undefined ? workout.id : "",
            title: state.inputs.title.value.trim(),
            date: new Date(state.inputs.date.value),
            image: state.inputs.image.value,
            description: state.inputs.description.value.trim(),
            // Ensure only valid tag id's are sent to the backend, which may be removed from other workout forms
            tagIds: selected.map((selected: Tag) => selected?.id).filter((id: string) => dictionary[id] !== undefined)
         };

         // We request to either add or update the workout instance
         const response: VitalityResponse<Workout> = workout === undefined
            ?  await addWorkout(payload) : await editWorkout(payload);

         // Add new workout in response body to state and display notification message
         if (response.status === "Success") {
            let newWorkouts: Workout[] = [];
            const returnedWorkout: Workout = response.body.data;

            if (workout === undefined) {
               // New workout added
               newWorkouts = [...state.inputs.workouts.value, returnedWorkout];
               // Edit the workout after construction
               setEdit(true);
            } else if (method === "delete") {
               // Remove the existing workout
               newWorkouts = [...state.inputs.workouts.value].filter((workout: Workout) => workout.id !== returnedWorkout.id);
            } else {
               // Update the existing workout
               newWorkouts = [...state.inputs.workouts.value].map((workout: Workout) => {
                  return workout.id === returnedWorkout.id ? returnedWorkout : workout;
               });
            }

            dispatch({
               type: "updateState",
               value: {
                  ...state,
                  inputs: {
                     ...state.inputs,
                     workouts: {
                        ...state.inputs.workouts,
                        value: newWorkouts
                     }
                  }
               }
            });
         }

         if (response.status !== "Error") {
            // Display the success or failure notification to the user
            updateNotification({
               status: response.status,
               message: response.body.message
            });
         } else {
            // Display errors
            dispatch({
               type: "updateStatus",
               value: response
            });
         }
      }
   };

   return (
      <div className = "relative">
         <div className = "flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon = {faPersonRunning}
               className = "text-6xl text-primary mt-1"
            />
            <h1 className = "text-3xl font-bold text-black mb-2">
               {edit ? "Edit" : "New"} Workout
            </h1>
         </div>
         <div className = "relative mt-2 w-full flex flex-col justify-center align-center text-left gap-3">
            <FontAwesomeIcon
               icon = {faArrowRotateLeft}
               onClick = {() => reset()}
               className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
            />
            <Input input = {state.inputs.title} label = "&#x1F58A; Title" dispatch = {dispatch} />
            <Input input = {state.inputs.date} label = "&#x1F4C5; Date" dispatch = {dispatch} />
            <ul className = "flex flex-row flex-wrap justify-center items-center">
               {
                  state.inputs.tags.data.selected.map((selected: Tag) => {
                     return (
                        selected !== undefined &&
                           <WorkoutTag input = {state.inputs.tags} label = "&#x1F50E; Tags" state = {state} dispatch = {dispatch} tag = {selected} selected = {true} key = {selected.id} />
                     );
                  })
               }
            </ul>
            <Input input = {state.inputs.search} label = "&#x1F50E; Tags" dispatch = {dispatch} />
            <TagSelection input = {state.inputs.tags} label = "Tags " dispatch = {dispatch} state = {state} />
            <TextArea input = {state.inputs.description} label = "&#x1F5DE; Description" dispatch = {dispatch} />
            <ImageSelection input = {state.inputs.image} label = "&#x1F587; URL" dispatch = {dispatch} />
            {
               edit && (
                  <Button
                     type = "button"
                     className = "bg-red-500 text-white h-[2.6rem]"
                     icon = {faTrash}
                     onClick = {(event) => handleSubmission(event, "delete")}
                  >
                     Delete
                  </Button>
               )
            }
            <Button
               type = "button"
               className = "bg-primary text-white h-[2.6rem]"
               icon = {props !== undefined ? faCloudArrowUp : faSquarePlus}
               onClick = {(event) => handleSubmission(event, "update")}
            >
               {
                  edit ? "Save" : "Create"
               }
            </Button>
            {
               edit && (
                  <div>
                     EDIT HERE!
                  </div>
               )
            }
         </div>
      </div>
   );
}