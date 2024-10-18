"use client";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import TextArea from "@/components/global/textarea";
import { VitalityAction, VitalityResponse, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faClock, faCloudArrowUp, faFeather, faHashtag, faPencil, faPlus, faRotateLeft, faTrash, faWeight } from "@fortawesome/free-solid-svg-icons";
import { Dispatch, useCallback, useContext, useState } from "react";
import { addExercise, updateExercise, Exercise, ExerciseSet, updateExercises, addExerciseSet } from "@/lib/workouts/exercises";
import { NotificationContext } from "@/app/layout";
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

const exercise: VitalityState = {
   exerciseTitle: {
      type: "text",
      id: "exerciseTitle",
      value: "",
      error: null,
      data: {
         id: "",
         edit: false
      }
   },
   weight: {
      type: "number",
      id: "weight",
      value: "",
      error: null,
      data: {}
   },
   repetitions: {
      type: "number",
      id: "repetitions",
      value: "",
      error: null,
      data: {}
   },
   hours: {
      type: "number",
      id: "hours",
      value: "",
      error: null,
      data: {}
   },
   minutes: {
      type: "number",
      id: "minutes",
      value: "",
      error: null,
      data: {}
   },
   seconds: {
      type: "number",
      id: "seconds",
      value: "",
      error: null,
      data: {}
   },
   text: {
      type: "text",
      id: "text",
      value: "",
      error: null,
      data: {}
   }
}

interface ExerciseInputProps {
   workout: Workout;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<any>>;
   onBlur?: () => void;
   onWorkoutSave?: (_exercises: Exercise[]) => void;
   setEditingWorkout: (_workout: Workout) => void;
}

function NewExerciseInput(props: ExerciseInputProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { workout, state, dispatch, onWorkoutSave } = props;

   const handleCreateNewExercise = useCallback(async() => {
      const payload: Exercise = {
         id: "",
         workout_id: workout.id,
         title: state.exerciseTitle.value.trim(),
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
            type: "displayErrors",
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
   }, [onWorkoutSave, dispatch, workout, state.exerciseTitle.value,
      updateNotification]);

   return (
      <div className = "w-full mb-2 mx-auto text-left" >
         <Input input = {state.exerciseTitle} label = "Title" icon = {faFeather} dispatch = {dispatch} onBlur = {props.onBlur} />
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
   const { updateNotification } = useContext(NotificationContext);
   const [editSet, setEditSet] = useState(set === undefined);
   const editingExerciseId: string = state.exerciseId.value;
   const editingExerciseSetId: string = state.exerciseId.data.setId;
   const displayEditInputs = editSet
      && editingExerciseId === exercise.id
      && (set === undefined &&  editingExerciseSetId === "" || set.id === editingExerciseSetId);

   console.log(editingExerciseId);
   console.log(editingExerciseSetId);

   // Construct payload exercise set with valid numeric inputs
   const constructNewExerciseSet = useCallback(() => {
      const parseNumber = (value) => {
         const num = +value;
         return isNaN(num) || num === 0 ? undefined : num;
      };

      return {
         ...set,
         id: set !== undefined ? set.id : "",
         exercise_id: exercise.id,
         set_order: set !== undefined ? set.set_order : exercise.sets.length,
         weight: parseNumber(state.weight.value),
         repetitions: parseNumber(state.repetitions.value),
         hours: parseNumber(state.hours.value),
         minutes: parseNumber(state.minutes.value),
         seconds: parseNumber(state.seconds.value),
         text: state.text.value
      };
   }, [exercise.sets.length, exercise.id, set, state.hours.value, state.minutes.value, state.repetitions.value, state.seconds.value, state.text.value, state.weight.value]);

   const handleExerciseSetSubmission = useCallback(async(method: "add" | "update" | "delete") => {
      const newSet: ExerciseSet = constructNewExerciseSet();
      const response: VitalityResponse<Exercise> = await addExerciseSet(newSet);

      if (response.status === "Success") {
         const newExercises: Exercise[] = [...workout.exercises].map((e) => e.id === exercise.id ? response.body.data : e);

         onWorkoutSave(newExercises);
         onBlur();
      } else if (response.status === "Error" && !(Object.keys(response.body.errors).length === 0)) {
         // Display errors
         dispatch({
            type: "displayErrors",
            value: response
         });
      } else {
         // Display failure message
         updateNotification({
            status: response.status,
            message: response.body.message
         });
      }

   }, [constructNewExerciseSet, dispatch, exercise, onWorkoutSave, onBlur, updateNotification, workout.exercises]);

   const handleInitializeEditSet = useCallback((event) => {
      event.stopPropagation();

      // Update exercise inputs
      dispatch({
         type: "initializeState",
         value: {
            exerciseId: {
               ...state.exerciseId,
               value: exercise.id,
               data: {
                  setId: set?.id ?? ""
               }
            },
            weight: {
               ...state.weight,
               value: set?.weight ?? ""
            },
            repetitions: {
               ...state.repetitions,
               value: set?.repetitions ?? ""
            },
            hours: {
               ...state.hours,
               value: set?.hours ?? ""
            },
            minutes: {
               ...state.minutes,
               value: set?.minutes ?? ""
            },
            seconds: {
               ...state.seconds,
               value: set?.seconds ?? ""
            },
            text: {
               ...state.text,
               value: set?.text ?? ""
            },
            setId: {
               ...state.setId,
               value: set?.id ?? ""
            }
         }
      });

      // Display inputs
      setEditSet(true);
   }, [dispatch, set?.hours, set?.minutes, set?.repetitions, set?.seconds, set?.text, set?.weight, state.hours,
      state.minutes, state.repetitions, state.seconds, state.text, state.weight, set?.id, state.setId, state.exerciseId, exercise.id]);

   return (
      displayEditInputs ? (
         <li className = "flex flex-col justify-start gap-2 w-full mx-auto pt-2 text-left">
            <Input input = {state.weight} label = "Weight" icon = {faWeight} dispatch = {dispatch} />
            <Input input = {state.repetitions} label = "Repetitions" icon = {faHashtag} dispatch = {dispatch} />
            <div className = "flex justify-start items-center gap-2">
               <Input input = {state.hours} label = "Hours" icon = {faClock} dispatch = {dispatch} />
               <Input input = {state.minutes} label = "Minutes" icon = {faClock} dispatch = {dispatch} />
               <Input input = {state.seconds} label = "Seconds" icon = {faClock} dispatch = {dispatch} />
            </div>
            <TextArea input = {state.text} label = "Text" icon = {faPencil} dispatch = {dispatch} />
            <Button
               type = "button"
               className = "w-full bg-grey-200 mb-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500 text-red-500"
               icon = {faRotateLeft}
               onClick = {(event) => {
                  event.stopPropagation();

                  if (set === undefined) {
                     // Remove from DOM for new exercise set inputs
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
               onClick = {(event) => {
                  event.stopPropagation();
                  if (set !== undefined) {
                     handleExerciseSetSubmission("add");
                  } else {
                     handleExerciseSetSubmission("update");
                  }
               }}
            >
               {set !== undefined ? "Save" : "Create"}
            </Button>
         </li >)
         : set !== undefined && (
            <li
               className = "flex flex-col justify-start font-medium gap-2 w-full mx-auto pt-2 pl-2 text-left border-2 border-black p-6"
               onDoubleClick = {handleInitializeEditSet}
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
               {set?.text && <p>{set.text}</p>}
            </li>
         )
   );
}

interface ExerciseProps extends ExerciseInputProps {
   exercise: Exercise;
}

function ExerciseContainer(props: ExerciseProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { workout, exercise, state, dispatch, onWorkoutSave } = props;
   const { edit, id } = state.exerciseTitle.data;
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
   } = useSortable({ id: exercise.id, disabled: displayEditTitle || addSet });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition
   };

   const handleSaveExerciseName = useCallback(async() => {
      // Construct new exercise for update method
      const newTitle: string = state.exerciseTitle.value.trim();
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
               ...state.exerciseTitle,
               error: [response.body.message]
            }
         });
      }
   }, [dispatch, exercise, onWorkoutSave, workout,
      state.exerciseTitle, updateNotification]);

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
            ...state.exerciseTitle,
            value: exercise.title,
            error: null,
            data: {
               edit: true,
               id: exercise.id
            }
         }
      });

      setEditTitle(true);
   }, [dispatch, exercise.title, state.exerciseTitle, exercise.id]);

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
                  <Input className = "mb-2" input = {state.exerciseTitle} label = "Title" icon = {faFeather} dispatch = {dispatch} onBlur = {() => setEditTitle(false)} />
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
         <ul className = "list-disc text-black flex flex-col gap-2">
            {
               exercise.sets.map((set: ExerciseSet) => {
                  return (<SetContainer {...props} set = {set} key = {set.id} />);
               })
            }
            {
               addSet && (
                  <SetContainer {...props} set = {undefined} onBlur = {() => setAddSet(false)} />
               )
            }
         </ul>
         <Button
            type = "button"
            className = "z-50 w-full bg-white text-black text-md mt-6 px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
            icon = {faPlus}
            onClick = {(event) => {
               event.stopPropagation();
               dispatch({
                  type: "updateInput",
                  value: {
                     ...state.exerciseId,
                     value: exercise.id,
                     data: {
                        setId: ""
                     }
                  }
               });
               setAddSet(true);
            }}
         >
            New Set
         </Button>
      </li>
   );
}

export default function Exercises(props: ExerciseInputProps): JSX.Element {
   const { workout, state, dispatch, setEditingWorkout } = props;
   const { id, edit } = state.exerciseTitle.data;
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
            ...state.exerciseTitle,
            value: "",
            error: null,
            data: {
               id: "",
               edit: false
            }
         }
      });

      setAddExercise(true);
   }, [dispatch, state.exerciseTitle]);

   const handleSaveWorkout = useCallback(async(updatingExercises: Exercise[]) => {
      // Update workout entry in database
      const response: VitalityResponse<Exercise[]> = await updateExercises(workout.id, updatingExercises);

      if (response.status === "Success") {
         // Update front-end state on success
         const newWorkouts: Workout[] = [...state.workouts.value].map((w) => w.id !== workout.id ? w : workout);

         dispatch({
            type: "updateInput",
            value: {
               ...state.workouts,
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
            type: "displayErrors",
            value: response
         });
      } else {
         // Display failure message
         updateNotification({
            status: response.status,
            message: response.body.message
         });
      }
   }, [setEditingWorkout, addExercise, dispatch, state.workouts, updateNotification, workout]);

   const handleDragEnd = (event) => {
      const { active, over } = event;

      if (edit === true && id === active.id) {
         // Don't allow drag and drop for editing exercises
         return;
      }

      if (active.id !== over?.id) {
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