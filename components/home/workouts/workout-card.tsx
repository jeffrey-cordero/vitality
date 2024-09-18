import Button from "@/components/global/button";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import ImageSelection from "@/components/home/workouts/image-selection";
import { TagSelection, WorkoutTag } from "@/components/home/workouts/tag-selection";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { VitalityAction, VitalityState } from "@/lib/global/form";
import { addWorkout, editWorkout, Tag, Workout } from "@/lib/workouts/workouts";
import { faArrowRotateLeft, faPersonRunning, faSquarePlus, faCloudArrowUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, FormEvent, useContext } from "react";

interface WorkoutCardProps {

}

export default function WorkoutCard(props: Workout | undefined, state: VitalityState, dispatch: Dispatch<VitalityAction>): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);

   const handleSubmission = async(event: FormEvent) => {
      event.preventDefault();

      if (user !== undefined) {
         const payload: Workout = {
            user_id: user.id,
            id: props !== undefined ? props.id : "",
            title: state.inputs.title.value.trim(),
            date: new Date(state.inputs.date.value),
            image: state.inputs.image.value,
            description: state.inputs.description.value.trim(),
            tags: state.inputs.tags.data.selected
         };

         const response = props !== undefined ? await editWorkout(payload, "update") : await addWorkout(payload);

         // Add new workout to state and display notification message
         if (response.status === "Success") {
            alert(1);

            dispatch({
               type: "updateState",
               value: {
                  ...state,
                  inputs: {
                     ...state.inputs,
                     workouts: {
                        ...state.inputs.workouts,
                        value: [...state.inputs.workouts.value, response.body.data]
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
      <form
         className = "relative"
         onSubmit = {handleSubmission}>
         <div className = "flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon = {faPersonRunning}
               className = "text-6xl text-primary mt-1"
            />
            <h1 className = "text-3xl font-bold text-black mb-2">
               {props !== undefined ? "Edit" : "New"} Workout
            </h1>
         </div>
         <div className = "relative mt-2 w-full flex flex-col justify-center align-center text-left gap-3">
            <FontAwesomeIcon
               icon = {faArrowRotateLeft}
               onClick = {() => dispatch({
                  type: "resetState", value: {
                     // Reset selected tags data
                     tags: {
                        ...state.inputs.tags.data,
                        selected: []
                     }
                  }
               })}
               className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
            />
            <Input input = {state.inputs.title} label = "&#x1F58A; Title" dispatch = {dispatch} />
            <Input input = {state.inputs.date} label = "&#x1F4C5; Date" dispatch = {dispatch} />
            <ul className = "flex flex-row flex-wrap justify-center items-center">
               {
                  state.inputs.tags.data.selected.map((selected: Tag) => {
                     return WorkoutTag({
                        input: state.inputs.tags,
                        label: "Tags",
                        dispatch: dispatch,
                        state: state
                     }, selected, true);
                  })
               }
            </ul>
            <Input input = {state.inputs.search} label = "&#x1F50E; Tags" dispatch = {dispatch} />
            <TagSelection input = {state.inputs.tags} label = "Tags " dispatch = {dispatch} state = {state} />
            <TextArea input = {state.inputs.description} label = "&#x1F5DE; Description" dispatch = {dispatch} />
            <ImageSelection input = {state.inputs.image} label = "&#x1F587; URL" dispatch = {dispatch} />
            {
               props !== undefined && (
                  <Button type = "submit" className = "bg-red-500  text-white h-[2.6rem]" icon = {faTrash}>
                     Delete
                  </Button>
               )
            }
            <Button type = "submit" className = "bg-primary text-white h-[2.6rem]" icon = {props !== undefined ? faCloudArrowUp : faSquarePlus}>
               {
                  props !== undefined ? "Save" : "Create"
               }
            </Button>
         </div>
      </form>
   );
}