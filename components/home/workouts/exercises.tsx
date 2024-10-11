"use client";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import TextArea from "@/components/global/textarea";
import { VitalityAction, VitalityResponse, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faClock, faCloudArrowUp, faFeather, faGrip, faHashtag, faPencil, faPlus, faRotateLeft, faWeight } from "@fortawesome/free-solid-svg-icons";
import { Dispatch, useCallback, useContext, useState } from "react";
import { addExercise, editExerciseTitle, Exercise, Set } from "@/lib/workouts/exercises";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import {
   DndContext,
   useDraggable,
   useDroppable
} from '@dnd-kit/core';

import {
   SortableContext,
   verticalListSortingStrategy,
   arrayMove
} from "@dnd-kit/sortable"

interface ExerciseInputProps {
   workout: Workout;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout | Exercise>>;
   onBlur?: () => void;
   onSave?: (_workout: Workout) => void;
   setEditingWorkout: (_workout: Workout) => void;
}

function NewExerciseInput(props: ExerciseInputProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const { workout, state, dispatch, onSave } = props;

   const handleCreateNewExercise = useCallback(async () => {
      const payload: Exercise = {
         user_id: user.id,
         workout_id: workout.id,
         id: "",
         title: state.inputs.exerciseTitle.value.trim(),
         exercise_order: workout.exercises.length,
         sets: []
      };

      const response: VitalityResponse<Exercise> = await addExercise(payload);
      const returnedExercise: Exercise = response.body.data;

      if (response.status === "Success") {
         const newExercises: Exercise[] = [...workout.exercises, returnedExercise];
         const newWorkout: Workout = { ...workout, exercises: newExercises };
         const newWorkouts: Workout[] = [...state.inputs.workouts.value].map((w) => w.id !== workout.id ? w : newWorkout);

         // Update overall workouts by including new exercise
         dispatch({
            type: "updateInput",
            value: {
               ...state.inputs.workouts,
               value: newWorkouts
            }
         });

         onSave(newWorkout);
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

      if (response.status === "Failure") {
         // Display failure notification to the user, if any
         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1250
         });
      }
   }, [onSave, dispatch, workout, state.inputs.exerciseTitle.value, state.inputs.workouts,
      updateNotification, user.id]);

   return (
      <div className="w-full mb-2 mx-auto text-left" >
         <Input input={state.inputs.exerciseTitle} label="Title" icon={faFeather} dispatch={dispatch} onBlur={props.onBlur} />
         <Button
            type="button"
            className="w-full bg-green-600 text-white mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
            icon={faFeather}
            onClick={handleCreateNewExercise}
         >
            Add Exercise
         </Button>
      </div>
   );
}

interface SetProps extends ExerciseInputProps {
   set: Set;
}

function SetContainer(props: SetProps): JSX.Element {
   const { set, state, dispatch } = props;
   const [editSet, setEditSet] = useState(false);
   const setId = state.inputs.setId.value;
   const displayEditInputs = editSet && set.id === setId;

   const handleSaveExerciseSet = useCallback(() => {
      setEditSet(false);
   }, []);

   const handleInitializeEditSet = useCallback(() => {
      // Update exercise inputs
      dispatch({
         type: "initializeState",
         value: {
            weight: {
               ...state.inputs.weight,
               value: set.weight ?? ""
            },
            repetitions: {
               ...state.inputs.repetitions,
               value: set.repetitions ?? ""
            },
            hours: {
               ...state.inputs.hours,
               value: set.hours ?? ""
            },
            minutes: {
               ...state.inputs.minutes,
               value: set.minutes ?? ""
            },
            seconds: {
               ...state.inputs.seconds,
               value: set.seconds ?? ""
            },
            text: {
               ...state.inputs.text,
               value: set.text ?? ""
            },
            setId: {
               ...state.inputs.setId,
               value: set.id
            }
         }
      });

      // Display inputs
      setEditSet(true);
   }, [dispatch, set.hours, set.minutes, set.repetitions, set.seconds, set.text, set.weight, state.inputs.hours,
      state.inputs.minutes, state.inputs.repetitions, state.inputs.seconds, state.inputs.text, state.inputs.weight,
      set.id, state.inputs.setId]);


   return (
      displayEditInputs ? (
         <div className="flex flex-col justify-start gap-2 w-full mx-auto pt-2 text-left">
            <Input input={state.inputs.weight} label="Weight" icon={faWeight} dispatch={dispatch} />
            <Input input={state.inputs.repetitions} label="Repetitions" icon={faHashtag} dispatch={dispatch} />
            <div className="flex justify-start items-center gap-2">
               <Input input={state.inputs.hours} label="Hours" icon={faClock} dispatch={dispatch} />
               <Input input={state.inputs.minutes} label="Minutes" icon={faClock} dispatch={dispatch} />
               <Input input={state.inputs.seconds} label="Seconds" icon={faClock} dispatch={dispatch} />
            </div>
            <TextArea input={state.inputs.text} label="Text" icon={faPencil} dispatch={dispatch} />
            <Button
               type="button"
               className="w-full bg-grey-200 mb-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500 text-red-500"
               icon={faRotateLeft}
               onClick={() => setEditSet(false)}
            >
               Cancel
            </Button>
            <Button
               type="button"
               className="w-full bg-green-600 text-white mb-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
               icon={faCloudArrowUp}
               onClick={handleSaveExerciseSet}
            >
               Save
            </Button>
         </div >)
         : (
            <div
               className="flex flex-col justify-start font-medium gap-2 w-full mx-auto pt-2 pl-2 text-left"
               onDoubleClick={handleInitializeEditSet}
            >
               {set.weight && <p>Weight - {set.weight}</p>}
               {set.repetitions && <p>Repetitions - {set.repetitions}</p>}
               {(set.hours || set.minutes || set.seconds) && (
                  <p>
                     Interval - {String(set.hours ?? 0).padStart(2, "0")}:
                     {String(set.minutes ?? 0).padStart(2, "0")}:
                     {String(set.seconds ?? 0).padStart(2, "0")}
                  </p>
               )}
               {set.text && <p>{set.text}</p>}

            </div>
         )
   );
}

interface ExerciseProps extends ExerciseInputProps {
   exercise: Exercise;
}

function ExerciseContainer(props: ExerciseProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { workout, exercise, state, dispatch, onSave } = props;
   const { edit, id } = state.inputs.exerciseTitle.data;
   const [editTitle, setEditTitle] = useState(false);
   const displayEditTitle = editTitle && edit && id === exercise.id;

   const handleSaveExerciseName = useCallback(async () => {
      const newTitle: string = state.inputs.exerciseTitle.value.trim();
      const response: VitalityResponse<boolean> = await editExerciseTitle(exercise.id, newTitle);

      if (response.status === "Success") {
         // Update the exercise
         const newExercise: Exercise = { ...exercise, title: newTitle };
         const newExercises: Exercise[] = [...workout.exercises].map((e) => e.id !== exercise.id ? e : newExercise);
         const newWorkout: Workout = {
            ...workout,
            exercises: newExercises
         };
         const newWorkouts: Workout[] = [...state.inputs.workouts.value].map((w) => w.id !== workout.id ? w : newWorkout);

         // Update overall workouts and hide the editTitle
         dispatch({
            type: "updateInput",
            value: {
               ...state.inputs.workouts,
               value: newWorkouts
            }
         });

         setEditTitle(false);
         onSave(newWorkout);
      } else if (response.status === "Failure") {
         // Display failure notification to the user, if any
         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1250
         });
      } else {
         // Add error message
         dispatch({
            type: "updateInput",
            value: {
               ...state.inputs.exerciseTitle,
               error: [response.body.message]
            }
         })
      }
   }, [dispatch, exercise, onSave, state.inputs.workouts, workout,
      state.inputs.exerciseTitle.value, updateNotification]);

   const handleInitializeEditExerciseName = useCallback(() => {
      dispatch({
         type: "updateInput",
         value: {
            ...state.inputs.exerciseTitle,
            value: exercise.title,
            error: null,
            data: {
               edit: true,
               id: exercise.id
            }
         }
      });

      setEditTitle(true);
   }, [dispatch, exercise.title, state.inputs.exerciseTitle, exercise.id]);

   return (
      <div
         className="w-full mx-auto text-left mt-4 cursor-pointer" >
         {
            displayEditTitle ? (
               <div>
                  <Input className="mb-2" input={state.inputs.exerciseTitle} label="Title" icon={faFeather} dispatch={dispatch} onBlur={() => setEditTitle(false)} />
                  <Button
                     type="button"
                     className="w-full bg-green-600 text-white mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
                     icon={faFeather}
                     onClick={handleSaveExerciseName}
                  >
                     Save
                  </Button>
               </div>
            ) : (
               <h1 onDoubleClick={handleInitializeEditExerciseName} className="text-xl mb-2">{exercise.title} (Order: {exercise.exercise_order}) </h1>
            )
         }
         {
            exercise.sets.map((set: Set) => {
               return (<SetContainer {...props} set={set} key={exercise.id} />);
            })
         }
         <Button
            type="button"
            className="w-full bg-white text-black px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
            icon={faPlus}
            onClick={() => alert(1)}
         >
            New Set
         </Button>
      </div>
   );
}

export default function Exercises(props: ExerciseInputProps): JSX.Element {
   const { workout, state, dispatch, setEditingWorkout } = props;
   const { edit } = state.inputs.exerciseTitle.data;
   const [addExercise, setAddExercise] = useState(false);
   const displayNewTitle: boolean = addExercise && !(edit);
   const exercises: Exercise[] = workout.exercises;

   const handleInitializeNewExerciseInput = useCallback(() => {
      dispatch({
         type: "updateInput",
         value: {
            ...state.inputs.exerciseTitle,
            value: "",
            error: null,
            data: {
               id: "",
               edit: false
            }
         }
      });

      setAddExercise(true);
   }, [dispatch, state.inputs.exerciseTitle]);

   const handleOnSave = useCallback((workout: Workout) => {
      // Updating editing workout in main workout component
      setEditingWorkout(workout);

      // Remove add exercise input
      setAddExercise(false);
   }, [setEditingWorkout]);

   const handleDragEnd = (event) => {
      const { active, over } = event;
  
      // If there is no item to drop on, return early
      if (!(over)) {
         return;
      }
  
      // Reorder exercises based on the drag-and-drop action
      const oldIndex = exercises.findIndex((exercise) => exercise.id === active.id);
      const newIndex = exercises.findIndex((exercise) => exercise.id === over.id);

      console.log(arrayMove(exercises, oldIndex, newIndex));

      // TODO: Update workout exercises

      
    };

   return (
      <div className="w-full mx-auto text-center font-bold flex flex-col justify-center items-center">
         {
            displayNewTitle &&
            <NewExerciseInput {...props}
               onSave={handleOnSave}
               onBlur={() => {
                  setAddExercise(false);
               }}
            />
         }
         <Button
            type="button"
            className="w-full bg-white text-black px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
            icon={faPlus}
            onClick={handleInitializeNewExerciseInput}
         >
            New Exercise
         </Button>
         <hr className="text-black w-full mt-4" />
         <DndContext onDragEnd={handleDragEnd}>
            <SortableContext items={exercises.map((exercise) => exercise.id)} strategy={verticalListSortingStrategy}>
            {
               workout.exercises.map((exercise: Exercise) => {
                  return (
                     <ExerciseContainer {...props} exercise={exercise} key={exercise.workout_id + exercise.id} onSave={handleOnSave} />
                  );
               })
            }
            </SortableContext>
         </DndContext>
      </div>

   );
}