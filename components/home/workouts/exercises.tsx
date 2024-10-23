"use client";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import TextArea from "@/components/global/textarea";
import { formReducer, handleResponse, VitalityChildProps, VitalityProps, VitalityResponse, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faClock, faCloudArrowUp, faFeather, faHashtag, faPencil, faPlus, faRotateLeft, faTrash, faWeight } from "@fortawesome/free-solid-svg-icons";
import { CSSProperties, use, useCallback, useContext, useReducer, useRef, useState } from "react";
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

const form: VitalityState = {
   name: {
      value: "",
      error: null,
      data: {
         id: "",
         edit: false
      }
   },
   weight: {
      value: "",
      error: null,
      data: {}
   },
   repetitions: {
      value: "",
      error: null,
      data: {}
   },
   hours: {
      value: "",
      error: null,
      data: {}
   },
   minutes: {
      value: "",
      error: null,
      data: {}
   },
   seconds: {
      value: "",
      error: null,
      data: {}
   },
   text: {
      value: "",
      error: null,
      data: {}
   },
   exerciseId: {
      value: null,
      error: null,
      data: {
         setId: ""
      }
   }
};

function NewExerciseInput(props: ExerciseProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { workout, localState, localDispatch, saveExercises } = props;

   const handleCreateNewExercise = useCallback(async() => {
      const payload: Exercise = {
         id: "",
         workout_id: workout.id,
         name: localState.name.value.trim(),
         exercise_order: workout.exercises.length,
         sets: []
      };

      const response: VitalityResponse<Exercise> = await addExercise(payload);

      const successMethod = () => {
         // Simply add the new exercise to array of exercises in editing workout
         const newExercises: Exercise[] = [...workout.exercises, response.body.data];
         saveExercises(newExercises);
      };

      handleResponse(localDispatch, response, successMethod, updateNotification, 1250);
   }, [localDispatch, localState.name.value, saveExercises, updateNotification, workout.exercises, workout.id]);

   return (
      <div className = "w-full mb-2 mx-auto text-left" >
         <Input
            id = "name"
            type = "text"
            label = "Name"
            icon = {faFeather}
            input = {localState.name}
            dispatch = {localDispatch}
            autoFocus
            required />
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

interface SetProps extends ExerciseProps {
   set: ExerciseSet | undefined;
}

function SetContainer(props: SetProps): JSX.Element {
   const { workout, exercise, set, localState, localDispatch, onBlur, saveExercises } = props;
   const { updateNotification } = useContext(NotificationContext);
   const [editSet, setEditSet] = useState(set === undefined);
   const editingExerciseId: string = localState.exerciseId.value;
   const editingExerciseSetId: string = localState.exerciseId.data.setId;
   const displayEditInputs = editSet
      && editingExerciseId === exercise.id
      && (set === undefined && editingExerciseSetId === ""
         || set?.id === editingExerciseSetId);

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
         weight: parseNumber(localState.weight.value),
         repetitions: parseNumber(localState.repetitions.value),
         hours: parseNumber(localState.hours.value),
         minutes: parseNumber(localState.minutes.value),
         seconds: parseNumber(localState.seconds.value),
         text: localState.text.value
      };
   }, [exercise.id, exercise.sets.length, localState.hours.value, localState.minutes.value,
      localState.repetitions.value, localState.seconds.value, localState.text.value,
      localState.weight.value, set]);

   const handleExerciseSetSubmission = useCallback(async(method: "add" | "update" | "delete") => {
      const newSet: ExerciseSet = constructNewExerciseSet();
      const response: VitalityResponse<Exercise> = await addExerciseSet(newSet);

      const successMethod = () => {
         // Update editing exercise
         const newExercises: Exercise[] = [...workout.exercises].map((e) => e.id === exercise.id ? response.body.data : e);
         saveExercises(newExercises);
         onBlur();
      };

      handleResponse(localDispatch, response, successMethod, updateNotification, 1250);
   }, [constructNewExerciseSet, exercise.id, localDispatch, onBlur, saveExercises, updateNotification, workout.exercises]);

   const handleInitializeEditSet = useCallback((event) => {
      event.stopPropagation();
      event.preventDefault();

      // Update exercise inputs
      localDispatch({
         type: "initializeState",
         value: {
            exerciseId: {
               ...localState.exerciseId,
               value: exercise.id,
               data: {
                  setId: set?.id ?? ""
               }
            },
            weight: {
               ...localState.weight,
               value: set?.weight ?? ""
            },
            repetitions: {
               ...localState.repetitions,
               value: set?.repetitions ?? ""
            },
            hours: {
               ...localState.hours,
               value: set?.hours ?? ""
            },
            minutes: {
               ...localState.minutes,
               value: set?.minutes ?? ""
            },
            seconds: {
               ...localState.seconds,
               value: set?.seconds ?? ""
            },
            text: {
               ...localState.text,
               value: set?.text ?? ""
            }
         }
      });

      // Display inputs
      setEditSet(true);
   }, [exercise.id, localDispatch, localState.exerciseId, localState.hours, localState.minutes, localState.repetitions,
      localState.seconds, localState.text, localState.weight, set?.hours, set?.id, set?.minutes, set?.repetitions,
      set?.seconds, set?.text, set?.weight]);

   return (
      displayEditInputs ? (
         <li className = "flex flex-col justify-start gap-2 w-full mx-auto pt-2 text-left">
            <Input
               id = "weight"
               type = "number"
               label = "Weight"
               icon = {faWeight}
               input = {localState.weight}
               dispatch = {localDispatch}
               autoFocus />
            <Input
               id = "repetitions"
               type = "number"
               label = "Repetitions"
               icon = {faHashtag}
               input = {localState.repetitions}
               dispatch = {localDispatch} />
            <div className = "flex justify-start items-center gap-2">
               <Input
                  id = "hours"
                  type = "number"
                  label = "Hours"
                  icon = {faClock}
                  input = {localState.hours}
                  dispatch = {localDispatch} />
               <Input
                  id = "minutes"
                  type = "number"
                  label = "Minutes"
                  icon = {faClock}
                  input = {localState.minutes}
                  dispatch = {localDispatch} />
               <Input
                  id = "seconds"
                  type = "number"
                  label = "Seconds"
                  icon = {faClock}
                  input = {localState.seconds}
                  dispatch = {localDispatch} />
            </div>
            <TextArea
               id = "text"
               type = "text"
               label = "Text"
               icon = {faPencil}
               input = {localState.text}
               dispatch = {localDispatch}
               required />
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

interface ExerciseProps extends ExercisesProps, VitalityChildProps {
   exercise: Exercise;
   saveExercises: (_updatingExercises: Exercise[]) => void;
   onBlur?: () => void;
}

function ExerciseContainer(props: ExerciseProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { workout, exercise, localState, localDispatch, saveExercises } = props;
   const { edit, id } = localState.name.data;
   const [editName, setEditName] = useState<boolean>(false);
   const [addSet, setAddSet] = useState<boolean>(false);
   const displayEditName = editName && edit && id === exercise.id;

   // Prevent drag and drop mechanisms when user is editing exercise information
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
   } = useSortable({ id: exercise.id, disabled: displayEditName || addSet });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition
   };

   const handleSaveExerciseName = useCallback(async() => {
      // Construct new exercise for update method
      const newName: string = localState.name.value.trim();
      const newExercise: Exercise = { ...exercise, name: newName };
      const response: VitalityResponse<Exercise> = await updateExercise(newExercise, "name");

      const successMethod = () => {
         // Update the overall workout exercises
         const newExercises: Exercise[] = [...workout.exercises].map((e) => e.id !== exercise.id ? e : newExercise);
         setEditName(false);
         saveExercises(newExercises);
      };

      handleResponse(localDispatch, response, successMethod, updateNotification, 1250);
   }, [exercise, localDispatch, localState.name.value, saveExercises, updateNotification, workout.exercises]);

   const handleDeleteExercise = useCallback(async() => {
      const newExercises: Exercise[] = [...workout.exercises].filter((e) => e.id !== exercise.id);
      const response: VitalityResponse<Exercise[]> = await updateExercises(workout.id, newExercises);

      const successMethod = () => {
         // Update the overall workout exercises with new exercises from backend response
         saveExercises(response.body.data);
      };

      handleResponse(localDispatch, response, successMethod, updateNotification, 1250);
   }, [exercise.id, localDispatch, saveExercises, updateNotification, workout.exercises, workout.id]);


   const handleInitializeEditExerciseName = useCallback(() => {
      localDispatch({
         type: "updateState",
         value: {
            id: "name",
            input: {
               ...localState.name,
               value: exercise.name,
               error: null,
               data: {
                  edit: true,
                  id: exercise.id
               }
            }
         }
      });

      setEditName(true);
   }, [exercise.id, exercise.name, localDispatch, localState.name]);

   const handleInitializeNewSet = useCallback(() => {
      // Reset exercise inputs
      localDispatch({
         type: "updateStates",
         value: {
            exerciseId: {
               ...localState.exerciseId,
               value: exercise.id,
               data: {
                  setId: ""
               }
            },
            weight: {
               ...localState.weight,
               value: ""
            },
            repetitions: {
               ...localState.repetitions,
               value: ""
            },
            hours: {
               ...localState.hours,
               value: ""
            },
            minutes: {
               ...localState.minutes,
               value: ""
            },
            seconds: {
               ...localState.seconds,
               value: ""
            },
            text: {
               ...localState.text,
               value: ""
            }
         }
      });

      setAddSet(true);
   }, [exercise.id, localDispatch, localState.exerciseId, localState.hours, localState.minutes,
      localState.repetitions, localState.seconds, localState.text, localState.weight]);

   return (
      <li
         className = "w-full mx-auto p-4 text-left focus:cursor-move"
         style = {style}
         ref = {setNodeRef}
      >
         {
            displayEditName ? (
               <div>
                  <Input
                     id = "name"
                     type = "text"
                     className = "mb-2"
                     label = "Name"
                     icon = {faFeather}
                     input = {localState.name}
                     dispatch = {localDispatch}
                     onBlur = {() => setEditName(false)}
                     autoFocus
                     required />
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
               <h1
                  onDoubleClick = {handleInitializeEditExerciseName}
                  className = "text-xl mb-2"
                  {...attributes}
                  {...listeners}
               >{exercise.exercise_order + 1}. {exercise.name}</h1>
            )
         }
         <ul className = "list-disc text-black flex flex-col gap-2">
            {
               exercise.sets.map((set: ExerciseSet) => {
                  return (<SetContainer
                     {...props}
                     set = {set}
                     key = {set.id} />);
               })
            }
            {
               addSet && (
                  <div>
                     <SetContainer
                        {...props}
                        set = {undefined}
                        onBlur = {() => setAddSet(false)} />
                  </div>
               )
            }
         </ul>
         <Button
            type = "button"
            className = "z-50 w-full bg-white text-black text-md mt-6 px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500"
            icon = {faPlus}
            onClick = {handleInitializeNewSet}
         >
            New Set
         </Button>
      </li>
   );
}

interface ExercisesProps extends VitalityProps {
   workout: Workout;
}

export default function Exercises(props: ExercisesProps): JSX.Element {
   const { workout, globalState, globalDispatch } = props;
   const [localState, localDispatch] = useReducer(formReducer, form);
   const [addExercise, setAddExercise] = useState(false);
   const id = localState.name.data.id;
   const edit = localState.name.data.id;

   const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates
      })
   );
   const displayNewName: boolean = addExercise && !(edit);
   const exercises: Exercise[] = workout.exercises;

   const handleInitializeNewExerciseInput = useCallback(() => {
      localDispatch({
         type: "updateState",
         value: {
            id: "name",
            input: {
               ...localState.name,
               value: "",
               error: null,
               data: {
                  id: "",
                  edit: false
               }
            }
         }
      });

      setAddExercise(true);
   }, [localDispatch, localState.name]);

   const handleSaveExercises = useCallback(async(updatingExercises: Exercise[]) => {
      // Update editing and overall workouts
      const newWorkout: Workout = { ...workout, exercises: updatingExercises };
      const newWorkouts: Workout[] = [...globalState.workouts.value].map((w) => w.id !== newWorkout.id ? w : newWorkout);
      const newFiltered: Workout[] = [...globalState.workouts.data.filtered].map((w) => w.id !== newWorkout.id ? w : newWorkout);

      // Update editing workout and overall workouts global state
      globalDispatch({
         type: "updateStates",
         value: {
            workout: {
               ...globalState.workout,
               value: newWorkout
            },
            workouts: {
               ...globalState.workouts,
               value: newWorkouts,
               data: {
                  ...globalState.workouts.data,
                  filtered: newFiltered
               }
            }
         }
      });

      // Remove add exercise input, if applicable
      if (addExercise) {
         setAddExercise(false);
      }
   }, [addExercise, globalDispatch, globalState.workout, globalState.workouts, workout]);

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

            if (exercise.id === over?.id) {
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

            handleSaveExercises(newExercises);
         }
      }
   };

   return (
      <div className = "w-full mx-auto text-center font-bold flex flex-col justify-center items-center">
         {
            displayNewName &&
            <NewExerciseInput
               {...props}
               localState = {localState}
               localDispatch = {localDispatch}
               exercise = {null}
               saveExercises = {handleSaveExercises}
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
            <SortableContext
               items = {exercises.map((exercise) => exercise.id)}
               strategy = {verticalListSortingStrategy}>
               <ol className = "w-full mx-auto pl-6 mt-2">
                  {
                     exercises.map((exercise: Exercise) => {
                        return (
                           <ExerciseContainer
                              {...props}
                              localState = {localState}
                              localDispatch = {localDispatch}
                              saveExercises = {handleSaveExercises}
                              exercise = {exercise}
                              key = {exercise.id}
                           />
                        );
                     })
                  }
               </ol>
            </SortableContext>
         </DndContext>
      </div>
   );
}