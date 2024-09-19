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
import { Dispatch, useCallback, useContext } from "react";

interface WorkoutCardProps {
   workout: Workout | undefined;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout>>;
   reset: () => void;
}

export default function WorkoutCard(props: WorkoutCardProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);

   const handleSubmission = useCallback(async(event: React.MouseEvent<HTMLButtonElement>, method: "update" | "delete") => {
      event.stopPropagation();

      if (user !== undefined) {
         const payload: Workout = {
            user_id: user.id,
            id: props.workout !== undefined ? props.workout.id : "",
            title: props.state.inputs.title.value.trim(),
            date: new Date(props.state.inputs.date.value),
            image: props.state.inputs.image.value,
            description: props.state.inputs.description.value.trim(),
            tags: props.state.inputs.tags.data.selected
         };

         // We request to either add or update the workout instance
         const response: VitalityResponse<Workout> = props.workout === undefined
            ?  await addWorkout(payload) : await editWorkout(payload, method);

         // Add new workout in response body to state and display notification message
         if (response.status === "Success") {
            let newWorkouts: Workout[] = [];

            if (props.workout === undefined) {
               // New workout added
               newWorkouts = [...props.state.inputs.workouts.value, response.body.data];
            } else if (method === "delete") {
               // Remove the existing workout
               newWorkouts = [...props.state.inputs.workouts.value].filter((workout: Workout) => workout.id !== payload.id);
            } else {
               // Update the existing workout
               newWorkouts = [...props.state.inputs.workouts.value].map((workout: Workout) => {
                  return workout.id === payload.id ? response.body.data : workout;
               });
            }

            props.dispatch({
               type: "updateState",
               value: {
                  ...props.state,
                  inputs: {
                     ...props.state.inputs,
                     workouts: {
                        ...props.state.inputs.workouts,
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
            props.dispatch({
               type: "updateStatus",
               value: response
            });
         }
      }
   }, [user, updateNotification, props]);

   return (
      <div className = "relative">
         <div className = "flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon = {faPersonRunning}
               className = "text-6xl text-primary mt-1"
            />
            <h1 className = "text-3xl font-bold text-black mb-2">
               {props.workout !== undefined ? "Edit" : "New"} Workout
            </h1>
         </div>
         <div className = "relative mt-2 w-full flex flex-col justify-center align-center text-left gap-3">
            <FontAwesomeIcon
               icon = {faArrowRotateLeft}
               onClick = {() => props.dispatch({
                  type: "resetState", value: {
                     // Reset selected tags data
                     tags: {
                        data: {
                           ...props.state.inputs.tags.data,
                           selected: []
                        },
                        value: props.state.inputs.tags.value
                     },
                     workouts: {
                        data: {
                           ...props.state.inputs.workouts.data
                        },
                        value: props.state.inputs.workouts.value
                     }
                  }
               })}
               className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
            />
            <Input input = {props.state.inputs.title} label = "&#x1F58A; Title" dispatch = {props.dispatch} />
            <Input input = {props.state.inputs.date} label = "&#x1F4C5; Date" dispatch = {props.dispatch} />
            <ul className = "flex flex-row flex-wrap justify-center items-center">
               {
                  props.state.inputs.tags.data.selected.map((selected: Tag) => {
                     return (
                        <WorkoutTag input = {props.state.inputs.tags} label = "&#x1F50E; Tags" dispatch = {props.dispatch} tag = {selected} selected = {true} key = {selected.id} />
                     );
                  })
               }
            </ul>
            <Input input = {props.state.inputs.search} label = "&#x1F50E; Tags" dispatch = {props.dispatch} />
            <TagSelection input = {props.state.inputs.tags} label = "Tags " dispatch = {props.dispatch} state = {props.state} />
            <TextArea input = {props.state.inputs.description} label = "&#x1F5DE; Description" dispatch = {props.dispatch} />
            <ImageSelection input = {props.state.inputs.image} label = "&#x1F587; URL" dispatch = {props.dispatch} />
            {
               props.workout !== undefined && (
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
                  props.workout !== undefined ? "Save" : "Create"
               }
            </Button>
         </div>
      </div>
   );
}