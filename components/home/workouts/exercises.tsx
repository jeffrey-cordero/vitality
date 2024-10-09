import Input from "@/components/global/input";
import Button from "@/components/global/button";
import { VitalityAction, VitalityResponse, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faClock, faFeather, faHashtag, faPencil, faPersonRunning, faPlus, faWeight } from "@fortawesome/free-solid-svg-icons";
import { Dispatch, useCallback, useContext, useState } from "react";
import { addExercise, Exercise } from "@/lib/workouts/exercises";
import { AuthenticationContext, NotificationContext } from "@/app/layout";

interface ExerciseInputProps {
   workout: Workout;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout | Exercise>>;
   onSave: () => void;
}

function NewExerciseInput(props: ExerciseInputProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const { workout, state, dispatch, onSave } = props;
   const exercises: Exercise[] = state.inputs.exercises.value;

   const handleCreateNewExercise = useCallback(async() => {
      const payload: Exercise = {
         user_id: user.id,
         workout_id: workout.id,
         id: "",
         title: state.inputs.exerciseTitle.value.trim(),
         sets: []
      };

      const response: VitalityResponse<Exercise> = await addExercise(payload);
      const returnedExercise: Exercise = response.body.data;

      if (response.status === "Success") {
         const newExercises: Exercise[] = [...exercises, returnedExercise];

         // Update exercises accordingly
         dispatch({
            type: "updateInput",
            value: {
               ...state.inputs.exercises,
               value: newExercises
            }
         });

         console.log(state.inputs.exercises);

         // Update workout accordingly with added exercise
         onSave();
      } else {
         // Display all errors, where title entry is replaced by exerciseTitle
         if (response.body.errors.title) {
            response.body.errors.exerciseTitle = response.body.errors.title;
            delete response.body.errors.title;
         }

         dispatch({
            type: "updateStatus",
            value: response
         });
      }

      if (response.status !== "Error") {
         // Display success or failure notification to the user
         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1250
         });
      }
   }, [onSave, dispatch, exercises, state.inputs.exerciseTitle.value, state.inputs.exercises, updateNotification, user.id, workout.id]);

   return (
      <div className = "w-full mt-4 mx-auto text-left" >
         <Input input = {state.inputs.exerciseTitle} label = "Title" icon = {faFeather} dispatch = {dispatch} />
         <Button
            type = "button"
            className = "w-full bg-green-600 text-white mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
            icon = {faFeather}
            onClick = {handleCreateNewExercise}
         >
            Add Exercise
         </Button>
      </div>
   );
}

interface ExerciseProps extends ExerciseInputProps {
   exercise: Exercise;
}

function ExerciseContainer(props: ExerciseProps): JSX.Element {
   const { state, dispatch } = props;
   const [editTitle, setEditTitle] = useState(false);
   const [visible, setVisible] = useState(true);

   const handleSaveExerciseSet = useCallback(() => {
      setVisible(false);
   }, []);

   const handleSaveExerciseName = useCallback(() => {
      const title: string = state.inputs.exerciseTitle.value.trim();

      if (title.length === 0) {
         dispatch({
            type: "updateInput",
            value: {
               ...state.inputs.exerciseTitle,
               error: ["Exercise title must be non-empty"]
            }
         });
      } else {
         setEditTitle(false);
      }
   }, [dispatch, state.inputs.exerciseTitle]);

   return (
      visible &&
         <div className = "w-full mx-auto text-left mt-4" >
            {
               editTitle ? (
                  <Input input = {state.inputs.exerciseTitle} label = "Title" icon = {faFeather} dispatch = {dispatch} onBlur = {handleSaveExerciseName} />
               ) : (
                  <h1 onDoubleClick = {() => setEditTitle(true)}>{state.inputs.exerciseTitle.value}</h1>
               )
            }
            {
               <div className = "flex flex-col justify-start gap-2 w-full mx-auto pt-2 text-left">
                  <Input input = {state.inputs.weight} label = "Weight" icon = {faWeight} dispatch = {dispatch} />
                  <Input input = {state.inputs.repetitions} label = "Repetitions" icon = {faHashtag} dispatch = {dispatch} />
                  <div className = "flex justify-start items-center gap-2">
                     <Input input = {state.inputs.hours} label = "Hours" icon = {faClock} dispatch = {dispatch} />
                     <Input input = {state.inputs.minutes} label = "Minutes" icon = {faClock} dispatch = {dispatch} />
                     <Input input = {state.inputs.seconds} label = "Seconds" icon = {faClock} dispatch = {dispatch} />
                  </div>
                  <Input input = {state.inputs.text} label = "Text" icon = {faPencil} dispatch = {dispatch} />
               </div>
            }
            <Button
               type = "button"
               className = "w-full bg-green-600 text-white mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
               icon = {faPersonRunning}
               onClick = {handleSaveExerciseSet}
            >
               Save
            </Button>
         </div>
   );
}

export default function Exercises(props: ExerciseInputProps): JSX.Element {
   const { workout, onSave } = props;
   const [addExercise, setAddExercise] = useState(false);

   return (
      <div className = "w-full mx-auto text-center font-bold flex flex-col justify-center items-center">
         <Button
            type = "button"
            className = "w-full bg-white text-black px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
            icon = {faPlus}
            onClick = {() => setAddExercise(true)}
         >
            New Exercise
         </Button>
         {
            addExercise &&
               <NewExerciseInput {...props}
                  onSave = {() => {
                     setAddExercise(true);
                     onSave();
                  }}
               />
         }
         <hr className = "text-black w-full mt-4" />
         {
            workout.exercises.map((exercise: Exercise) => {
               return (
                  <ExerciseContainer {...props} exercise = {exercise} key={exercise.workout_id + exercise.id} />
               );
            })
         }
      </div>

   );
}