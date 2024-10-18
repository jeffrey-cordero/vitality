"use client";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import TextArea from "@/components/global/textarea";
import { VitalityAction, VitalityResponse, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faClock, faCloudArrowUp, faFeather, faHashtag, faPencil, faPlus, faRotateLeft, faTrash, faWeight } from "@fortawesome/free-solid-svg-icons";
import { Dispatch, useCallback, useContext, useState } from "react";
import { addExercise, updateExercise, Exercise, ExerciseSet, updateExercises } from "@/lib/workouts/exercises";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import {
   DndContext,
   closestCenter,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors
} from "@dnd-kit/core";
import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
   useSortable,
   verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ExerciseInputProps {
   workout: Workout;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout | Exercise | Exercise[]>>;
   onBlur?: () => void;
   onWorkoutSave?: (_exercises: Exercise[]) => void;
   setEditingWorkout: (_workout: Workout) => void;
}

function NewExerciseInput(props: ExerciseInputProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const { workout, state, dispatch, onWorkoutSave } = props;

   const handleCreateNewExercise = useCallback(async() => {
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
         onWorkoutSave(newExercises);
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
   }, [onWorkoutSave, dispatch, workout, state.inputs.exerciseTitle.value,
      updateNotification, user.id]);

   return (
      <div className = "w-full mb-2 mx-auto text-left" >
         <Input input = {state.inputs.exerciseTitle} label = "Title" icon = {faFeather} dispatch = {dispatch} onBlur = {props.onBlur} />
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

interface SetProps extends ExerciseInputProps {
   exercise: Exercise;
   set: ExerciseSet | undefined;
}

function SetContainer(props: SetProps): JSX.Element {
   const { workout, exercise, set, state, dispatch, onBlur, onWorkoutSave } = props;
   const [exerciseSetObject, setExerciseSetObject] = useState<ExerciseSet | undefined>(set);
   const [editSet, setEditSet] = useState(exerciseSetObject === undefined);
   const setId = state.inputs.setId.value;
   const displayEditInputs = editSet && exerciseSetObject === undefined || exerciseSetObject.id === setId;

   const handleSaveExercise = useCallback(async(event) => {
      event.stopPropagation();

      const parseNumber = (value) => {
         const num = +value;
         // Return null if NaN, otherwise return the number
         return isNaN(num) ? null : num;
      };

      // Handle new set array construction
      const newSet: ExerciseSet = {
         ...exerciseSetObject,
         id: exerciseSetObject !== undefined ? exerciseSetObject.id : undefined,
         weight: parseNumber(state.inputs.weight.value),
         repetitions: parseNumber(state.inputs.repetitions.value),
         hours: parseNumber(state.inputs.hours.value),
         minutes: parseNumber(state.inputs.minutes.value),
         seconds: parseNumber(state.inputs.seconds.value),
         text: state.inputs.text.value
      };

      const newSets: ExerciseSet[] = exerciseSetObject === undefined ?
         [...exercise.sets, newSet] : [...exercise.sets].map((s) => s.id === setId ? newSet : s);

      // Update exercise entry in database
      const newExercise: Exercise = {
         ...exercise,
         sets: newSets
      };

      const response: VitalityResponse<Exercise> = await updateExercise(newExercise, "sets");

      if (response.status === "Success") {
         // Update workout with new exercises, including the updating exercise sets from backend response
         const newExercises: Exercise[] = [...workout.exercises].map((e) => e.id === exercise.id ? response.body.data : e);

         if (exerciseSetObject === undefined) {
            setExerciseSetObject(newSet);
         }

         onWorkoutSave(newExercises);
         setEditSet(false);
      } else {
         alert("ERROR");
      }
   }, [exercise, exerciseSetObject, onWorkoutSave, setId, state.inputs.hours.value, state.inputs.minutes.value, state.inputs.repetitions.value, state.inputs.seconds.value, state.inputs.text.value, state.inputs.weight.value, workout.exercises]);

   const handleInitializeEditSet = useCallback(() => {
      // Update exercise inputs
      dispatch({
         type: "initializeState",
         value: {
            weight: {
               ...state.inputs.weight,
               value: exerciseSetObject?.weight ?? ""
            },
            repetitions: {
               ...state.inputs.repetitions,
               value: exerciseSetObject?.repetitions ?? ""
            },
            hours: {
               ...state.inputs.hours,
               value: exerciseSetObject?.hours ?? ""
            },
            minutes: {
               ...state.inputs.minutes,
               value: exerciseSetObject?.minutes ?? ""
            },
            seconds: {
               ...state.inputs.seconds,
               value: exerciseSetObject?.seconds ?? ""
            },
            text: {
               ...state.inputs.text,
               value: exerciseSetObject?.text ?? ""
            },
            setId: {
               ...state.inputs.setId,
               value: exerciseSetObject?.id ?? ""
            }
         }
      });

      // Display inputs
      setEditSet(true);
   }, [dispatch, exerciseSetObject?.hours, exerciseSetObject?.minutes, exerciseSetObject?.repetitions, exerciseSetObject?.seconds, exerciseSetObject?.text, exerciseSetObject?.weight, state.inputs.hours,
      state.inputs.minutes, state.inputs.repetitions, state.inputs.seconds, state.inputs.text, state.inputs.weight,
      exerciseSetObject?.id, state.inputs.setId]);

   return (
      displayEditInputs ? (
         <div className = "flex flex-col justify-start gap-2 w-full mx-auto pt-2 text-left">
            <Input input = {state.inputs.weight} label = "Weight" icon = {faWeight} dispatch = {dispatch} />
            <Input input = {state.inputs.repetitions} label = "Repetitions" icon = {faHashtag} dispatch = {dispatch} />
            <div className = "flex justify-start items-center gap-2">
               <Input input = {state.inputs.hours} label = "Hours" icon = {faClock} dispatch = {dispatch} />
               <Input input = {state.inputs.minutes} label = "Minutes" icon = {faClock} dispatch = {dispatch} />
               <Input input = {state.inputs.seconds} label = "Seconds" icon = {faClock} dispatch = {dispatch} />
            </div>
            <TextArea input = {state.inputs.text} label = "Text" icon = {faPencil} dispatch = {dispatch} />
            <Button
               type = "button"
               className = "w-full bg-grey-200 mb-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500 text-red-500"
               icon = {faRotateLeft}
               onClick = {(event) => {
                  event.stopPropagation();

                  if (exerciseSetObject === undefined) {
                     // Remove from DOM for new set inputs
                     onBlur();
                  }

                  setEditSet(false);
               }}
            >
               Cancel
            </Button>
            <Button
               type = "button"
               className = "w-full bg-green-600 text-white mb-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
               icon = {faCloudArrowUp}
               onClick = {handleSaveExercise}
            >
               Save
            </Button>
         </div >)
         : (
            <div
               className = "flex flex-col justify-start font-medium gap-2 w-full mx-auto pt-2 pl-2 text-left"
               onDoubleClick = {handleInitializeEditSet}
            >
               {exerciseSetObject?.weight && <p>Weight - {set.weight}</p>}
               {exerciseSetObject?.repetitions && <p>Repetitions - {set.repetitions}</p>}
               {(exerciseSetObject?.hours || exerciseSetObject?.minutes || exerciseSetObject?.seconds) && (
                  <p>
                     Interval - {String(exerciseSetObject?.hours ?? 0).padStart(2, "0")}:
                     {String(exerciseSetObject?.minutes ?? 0).padStart(2, "0")}:
                     {String(exerciseSetObject?.seconds ?? 0).padStart(2, "0")}
                  </p>
               )}
               {exerciseSetObject?.text && <p>{set.text}</p>}
            </div>
         )
   );
}

interface ExerciseProps extends ExerciseInputProps {
   exercise: Exercise;
}

function ExerciseContainer(props: ExerciseProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { workout, exercise, state, dispatch, onWorkoutSave } = props;
   const { edit, id } = state.inputs.exerciseTitle.data;
   const [editTitle, setEditTitle] = useState<boolean>(false);
   const [addSet, setAddSet] = useState<boolean>(false);
   const displayEditTitle = editTitle && edit && id === exercise.id;

   // Prevent drag and drop mechanisms when user is editing exercise information
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
   } = useSortable({ id: exercise.id, disabled: displayEditTitle });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition
   };

   const handleSaveExerciseName = useCallback(async() => {
      // Construct new exercise for update method
      const newTitle: string = state.inputs.exerciseTitle.value.trim();
      const newExercise: Exercise = { ...exercise, title: newTitle };
      const response: VitalityResponse<Exercise> = await updateExercise(newExercise, "title");

      if (response.status === "Success") {
         // Update the overall workout exercises
         const newExercises: Exercise[] = [...workout.exercises].map((e) => e.id !== exercise.id ? e : newExercise);

         setEditTitle(false);
         onWorkoutSave(newExercises);
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
         });
      }
   }, [dispatch, exercise, onWorkoutSave, workout,
      state.inputs.exerciseTitle, updateNotification]);

   const handleDeleteExercise = useCallback(async() => {
      const newExercises: Exercise[] = [...workout.exercises].filter((e) => e.id !== exercise.id);
      const response: VitalityResponse<Exercise[]> = await updateExercises(workout.id, newExercises);

      if (response.status === "Success") {
         // Update the overall workout exercises with new exercises from backend response
         onWorkoutSave(response.body.data as Exercise[]);
      } else {
         // Display error or failure notification to the user, if any
         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1250
         });
      }
   }, [exercise.id, onWorkoutSave, updateNotification, workout.exercises, workout.id]);

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
      <li
         className = "w-full mx-auto p-4 text-left focus:cursor-move"
         ref = {setNodeRef}
         style = {style}
         {...attributes}
         {...listeners}
      >
         {
            displayEditTitle ? (
               <div>
                  <Input className = "mb-2" input = {state.inputs.exerciseTitle} label = "Title" icon = {faFeather} dispatch = {dispatch} onBlur = {() => setEditTitle(false)} />
                  <Button
                     type = "button"
                     className = "w-full bg-green-600 text-white text-md  mt-2 px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
                     icon = {faFeather}
                     onClick = {handleSaveExerciseName}
                  >
                     Save
                  </Button>
                  <Button
                     type = "button"
                     className = "w-full bg-red-600 text-white text-md mt-2 px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
                     icon = {faTrash}
                     onClick = {handleDeleteExercise}
                  >
                     Delete
                  </Button>
               </div>
            ) : (
               <h1 onDoubleClick = {handleInitializeEditExerciseName} className = "text-xl mb-2">{exercise.title}</h1>
            )
         }
         {
            exercise.sets.map((set: ExerciseSet) => {
               return (<SetContainer {...props} set = {set} key = {exercise.id} onBlur = {undefined} />);
            })
         }
         {
            addSet && (
               <SetContainer {...props} set = {undefined} onBlur = {() => setAddSet(false)} />
            )
         }
         {
            !(addSet) && (
               <Button
                  type = "button"
                  className = "z-50 w-full bg-white text-black text-md mt-6 px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
                  icon = {faPlus}
                  onClick = {(event) => {
                     event.stopPropagation();
                     setAddSet(true);
                  }}
               >
                  New Set
               </Button>
            )
         }
      </li>
   );
}

export default function Exercises(props: ExerciseInputProps): JSX.Element {
   const { workout, state, dispatch, setEditingWorkout } = props;
   const { id, edit } = state.inputs.exerciseTitle.data;
   const { updateNotification } = useContext(NotificationContext);
   const [addExercise, setAddExercise] = useState(false);
   const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates
      })
   );
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

   const handleSaveWorkout = useCallback(async(updatingExercises: Exercise[]) => {
      // Update workout entry in database
      const response: VitalityResponse<Exercise[]> = await updateExercises(workout.id, updatingExercises);

      if (response.status === "Success") {
         // Update front-end state on success
         const newWorkouts: Workout[] = [...state.inputs.workouts.value].map((w) => w.id !== workout.id ? w : workout);

         dispatch({
            type: "updateInput",
            value: {
               ...state.inputs.workouts,
               value: newWorkouts
            }
         });

         // Updating editing workout in main workout component
         setEditingWorkout({ ...workout, exercises: response.body.data });

         // Remove add exercise input, if applicable
         if (addExercise) {
            setAddExercise(false);
         }
      } else if (response.status === "Error") {
         // Display errors
         dispatch({
            type: "updateStatus",
            value: response
         });
      } else {
         // Display failure message
         updateNotification({
            status: response.status,
            message: response.body.message
         });
      }
   }, [setEditingWorkout, addExercise, dispatch, state.inputs.workouts, updateNotification, workout]);

   const handleDragEnd = (event) => {
      const { active, over } = event;

      if (edit === true && id === active.id) {
         // Don't allow drag and drop for editing exercises
         return;
      }

      if (active.id !== over.id) {
         let oldIndex: number, newIndex: number;

         for (const exercise of exercises) {
            if (exercise.id === active.id) {
               // Original exercise
               oldIndex = exercise.exercise_order;
            }

            if (exercise.id === over.id) {
               // Swapping exercise
               newIndex = exercise.exercise_order;
            }
         }

         if (oldIndex !== undefined && newIndex !== undefined) {
            // Use arrayMove to reorder exercises
            let newExercises: Exercise[] = arrayMove(exercises, oldIndex, newIndex);

            // Update exercise_order
            newExercises = newExercises.map((exercise, index) => ({
               ...exercise,
               exercise_order: index
            }));

            handleSaveWorkout(newExercises);
         }
      }
   };

   return (
      <div className = "w-full mx-auto text-center font-bold flex flex-col justify-center items-center">
         {
            displayNewTitle &&
            <NewExerciseInput {...props}
               onWorkoutSave = {handleSaveWorkout}
               onBlur = {() => {
                  setAddExercise(false);
               }}
            />
         }
         <Button
            type = "button"
            className = "w-full bg-white text-black px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
            icon = {faPlus}
            onClick = {handleInitializeNewExerciseInput}
         >
            New Exercise
         </Button>
         <hr className = "text-black w-full mt-4" />
         <DndContext
            sensors = {sensors}
            collisionDetection = {closestCenter}
            onDragEnd = {handleDragEnd}
         >
            <SortableContext items = {exercises.map((exercise) => exercise.id)} strategy = {verticalListSortingStrategy}>
               <ol className = "w-full mx-auto list-decimal pl-6 mt-2">
                  {
                     workout.exercises.map((exercise: Exercise) => {
                        return (
                           <ExerciseContainer {...props} exercise = {exercise} key = {exercise.id} onWorkoutSave = {handleSaveWorkout} />
                        );
                     })

                  }
               </ol>
            </SortableContext>
         </DndContext>
      </div>

   );
}