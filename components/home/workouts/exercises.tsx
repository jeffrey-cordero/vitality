import Input from "@/components/global/input";
import Button from "@/components/global/button";
import { VitalityAction, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faClock, faFeather, faFlask, faHashtag, faKeyboard, faPencil, faPersonRunning, faPlus, faWaveSquare, faWeight } from "@fortawesome/free-solid-svg-icons";
import { Dispatch, useCallback, useState } from "react";


interface ExercisesProps {
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout>>;
}

function Exercise(props: ExercisesProps): JSX.Element {
   const { state, dispatch } = props;
   const [editTitle, setEditTitle] = useState(false);
   const [visible, setVisible] = useState(true);
   const [text, setCustom] = useState(false);

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
                  <h1 onDoubleClick = {() => setEditTitle(true)}>{ state.inputs.exerciseTitle.value }</h1>
               )
            }
            {
               text === false ? (
                  <div className = "flex flex-col justify-start gap-2 w-full mx-auto py-4 text-left">
                     <Input input = {state.inputs.weight} label = "Weight?" icon = {faWeight} dispatch = {dispatch} />
                     <Input input = {state.inputs.repetitions} label = "Repetitions?" icon = {faHashtag} dispatch = {dispatch} />
                     <div className = "flex justify-start items-center gap-2">
                        <Input input = {state.inputs.hours} label = "Hours?" icon = {faClock} dispatch = {dispatch} />
                        <Input input = {state.inputs.minutes} label = "Minutes?" icon = {faClock} dispatch = {dispatch} />
                        <Input input = {state.inputs.seconds} label = "Seconds?" icon = {faClock} dispatch = {dispatch} />
                     </div>
                  </div>
               ) : (
                  <div className = "w-full mx-auto py-4 text-left">
                     <Input input = {state.inputs.text} label = "Text" icon = {faPencil} dispatch = {dispatch} />
                  </div>
               )
            }
            <Button
               type = "button"
               className = "w-full bg-purple-600 text-white px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
               icon = {text ? faFlask : faKeyboard}
               onClick = {() => setCustom(!(text))}
            >
               {text ? "Default" : "Text"}
            </Button>
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


export default function Exercises(props: ExercisesProps): JSX.Element  {
   return (
      <div className = "w-full mx-auto text-center my-4 font-bold flex flex-col justify-center items-center">
         <hr className = "text-black w-full mb-4" />
         <Exercise {...props} />
         <Button
            type = "button"
            className = "w-full bg-white text-black mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
            icon = {faPlus}
            onClick = {() => alert(1)}
         >
            New Exercise
         </Button>
      </div>

   );
}