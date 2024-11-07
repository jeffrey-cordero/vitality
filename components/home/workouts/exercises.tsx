"use client";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import TextArea from "@/components/global/textarea";
import { formReducer, handleResponse, VitalityChildProps, VitalityProps, VitalityResponse, VitalityState } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { faAlignJustify, faArrowRotateLeft, faArrowUp91, faCloudArrowUp, faDumbbell, faPenRuler, faPlus, faRotateLeft, faStopwatch, faCaretRight, faCaretDown, faCircleNotch, faPersonRunning } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { addExercise, updateExercise, Exercise, ExerciseSet, updateExercises } from "@/lib/workouts/exercises";
import { NotificationContext } from "@/app/layout";
import { useDoubleTap } from "use-double-tap";
import {
   DndContext,
   closestCenter,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   TouchSensor
} from "@dnd-kit/core";
import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
   useSortable,
   verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Conformation from "@/components/global/confirmation";

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
   const { workout, localState, localDispatch, saveExercises, onBlur } = props;

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
         onBlur();
      };

      handleResponse(localDispatch, response, successMethod, updateNotification);
   }, [localDispatch, localState.name.value, saveExercises, updateNotification, workout.exercises, workout.id, onBlur]);

   return (
      <div
         className = "w-full flex flex-col justify-center align-center text-left gap-2">
         <Input
            id = "name"
            type = "text"
            label = "Name"
            icon = {faPenRuler}
            input = {localState.name}
            dispatch = {localDispatch}
            onSubmit = {() => handleCreateNewExercise()}
            autoComplete = "none"
            autoFocus
            required />
         <Button
            type = "button"
            className = "w-full bg-grey-200 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-blue-500 focus:ring-blue-500 text-red-500"
            icon = {faRotateLeft}
            onClick = {() => {
               onBlur();
            }}
         >
            Cancel
         </Button>
         <Button
            type = "button"
            className = "w-full bg-green-600 text-white px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-blue-500 focus:ring-blue-500"
            icon = {faPenRuler}
            onClick = {handleCreateNewExercise}
         >
            Add Exercise
         </Button>
      </div>
   );
}

interface SetProps extends ExerciseProps {
   set: ExerciseSet | undefined;
   reset: () => void;
}

function SetContainer(props: SetProps): JSX.Element {
   const { workout, exercise, set, localState, localDispatch, onBlur, reset, saveExercises } = props;
   const { updateNotification } = useContext(NotificationContext);
   const [editSet, setEditSet] = useState(set === undefined);
   const editingExerciseId: string = localState.exerciseId.value;
   const editingExerciseSetId: string = localState.exerciseId.data.setId;
   const displayEditInputs = editSet
      && editingExerciseId === exercise.id
      && (set === undefined && editingExerciseSetId === ""
         || set?.id === editingExerciseSetId);

   // Prevent drag and drop mechanisms when user is editing set information
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
   } = useSortable({ id: set?.id, disabled: set === undefined || displayEditInputs });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition
   };

   // Construct payload exercise set with valid numeric inputs
   const constructNewExerciseSet = useCallback(() => {
      const handleParseNumber = (value) => {
         const isEmpty = typeof value === "string" && value.trim().length === 0;
         const num = +(value);
         return isEmpty || isNaN(num) || num < 0 ? null : num;
      };

      return {
         ...set,
         id: set !== undefined ? set.id : "",
         exercise_id: exercise.id,
         set_order: set !== undefined ? set.set_order : exercise.sets.length,
         weight: handleParseNumber(localState.weight.value),
         repetitions: handleParseNumber(localState.repetitions.value),
         hours: handleParseNumber(localState.hours.value),
         minutes: handleParseNumber(localState.minutes.value),
         seconds: handleParseNumber(localState.seconds.value),
         text: localState.text.value
      };
   }, [exercise.id, exercise.sets.length, localState.hours.value, localState.minutes.value,
      localState.repetitions.value, localState.seconds.value, localState.text.value,
      localState.weight.value, set]);

   const handleExerciseSetSubmission = useCallback(async(method: "update" | "delete") => {
      const newSet: ExerciseSet = constructNewExerciseSet();
      let response: VitalityResponse<Exercise>;

      if (set === undefined) {
         const newSets: ExerciseSet[] = [...exercise.sets, newSet];
         const newExercise: Exercise = {
            ...exercise,
            sets: newSets
         };

         response = await updateExercise(newExercise, "sets");
      } else {
         // Current exercise will have a given set updated or deleted
         const newSets: ExerciseSet[] =
            method === "update" ?
               [...exercise.sets].map((s) => s.id === newSet.id ? newSet : s)
               :
               [...exercise.sets].filter((s) => s.id !== newSet.id);
         const newExercise: Exercise = {
            ...exercise,
            sets: newSets
         };
         response = await updateExercise(newExercise, "sets");
      }

      const successMethod = () => {
         // Update editing exercise
         const newExercises: Exercise[] = [...workout.exercises].map((e) => e.id === exercise.id ? response.body.data : e);
         saveExercises(newExercises);
         setEditSet(false);
         onBlur();
      };

      handleResponse(localDispatch, response, successMethod, updateNotification);
   }, [set, exercise, constructNewExerciseSet, localDispatch, saveExercises, updateNotification, workout.exercises, onBlur]);

   const handleInitializeEditSet = useCallback(() => {
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
               value: set?.weight ?? "",
               error: null
            },
            repetitions: {
               ...localState.repetitions,
               value: set?.repetitions ?? "",
               error: null
            },
            hours: {
               ...localState.hours,
               value: set?.hours ?? "",
               error: null
            },
            minutes: {
               ...localState.minutes,
               value: set?.minutes ?? "",
               error: null
            },
            seconds: {
               ...localState.seconds,
               value: set?.seconds ?? "",
               error: null
            },
            text: {
               ...localState.text,
               value: set?.text ?? "",
               error: null
            }
         }
      });

      // Display inputs
      setEditSet(true);
   }, [exercise.id, localDispatch, localState.exerciseId, localState.hours, localState.minutes, localState.repetitions,
      localState.seconds, localState.text, localState.weight, set?.hours, set?.id, set?.minutes, set?.repetitions,
      set?.seconds, set?.text, set?.weight]);

   const doubleTap = useDoubleTap(handleInitializeEditSet);

   return (
      <div
         ref = {setNodeRef}
         style = {style}
         className = "w-full mx-auto px-4 sm:px-8"
      >
         {
            displayEditInputs ? (
               <li className = "relative flex flex-col justify-start items-stretch gap-2 w-full mx-auto mt-6 text-center font-medium">
                  <FontAwesomeIcon
                     icon = {faArrowRotateLeft}
                     onClick = {reset}
                     className = "absolute top-[-25px] right-[10px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
                  />
                  <Input
                     id = "weight"
                     type = "number"
                     label = "Weight"
                     min = "0"
                     icon = {faDumbbell}
                     input = {localState.weight}
                     dispatch = {localDispatch}
                     onSubmit = {() => handleExerciseSetSubmission("update")}
                  />
                  <Input
                     id = "repetitions"
                     type = "number"
                     label = "Repetitions"
                     min = "0"
                     icon = {faArrowUp91}
                     input = {localState.repetitions}
                     dispatch = {localDispatch}
                     onSubmit = {() => handleExerciseSetSubmission("update")}
                  />
                  <div className = "flex flex-col sm:flex-row justify-between items-start gap-2">
                     <div className = "w-full mx-auto">
                        <Input
                           id = "hours"
                           type = "number"
                           label = "Hours"
                           min = "0"
                           icon = {faStopwatch}
                           input = {localState.hours}
                           dispatch = {localDispatch}
                           onSubmit = {() => handleExerciseSetSubmission("update")}
                        />
                     </div>
                     <div className = "w-full mx-auto">
                        <Input
                           id = "minutes"
                           type = "number"
                           label = "Minutes"
                           min = "0"
                           icon = {faStopwatch}
                           input = {localState.minutes}
                           dispatch = {localDispatch}
                           onSubmit = {() => handleExerciseSetSubmission("update")}
                        />
                     </div>
                     <div className = "w-full mx-auto">
                        <Input
                           id = "seconds"
                           type = "number"
                           label = "Seconds"
                           min = "0"
                           icon = {faStopwatch}
                           input = {localState.seconds}
                           dispatch = {localDispatch}
                           onSubmit = {() => handleExerciseSetSubmission("update")}
                        />
                     </div>
                  </div>
                  <TextArea
                     id = "text"
                     type = "text"
                     label = "Text"
                     icon = {faAlignJustify}
                     input = {localState.text}
                     dispatch = {localDispatch}
                     required />
                  <Button
                     type = "button"
                     className = "w-full bg-grey-200 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-blue-500 focus:ring-blue-500 text-red-500"
                     icon = {faRotateLeft}
                     onClick = {() => {
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
                     className = "w-full bg-green-600 text-white px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-blue-500 focus:ring-blue-500"
                     icon = {faCloudArrowUp}
                     onClick = {() => handleExerciseSetSubmission("update")}
                  >
                     {set !== undefined ? "Update" : "Create"}
                  </Button>
                  {
                     set !== undefined && (
                        <Conformation
                           message = "Delete this set?"
                           onConformation = {() => handleExerciseSetSubmission("delete")}
                        />
                     )
                  }
               </li >)
               : (
                  set !== undefined && (
                     <li className = "flex flex-row justify-start items-start font-semibold gap-2 w-full mx-auto pt-2 text-left text-md cursor-move whitespace-pre-wrap break-all">
                        <div
                           className = "cursor-ns-resize text-sm pt-1"
                           {...attributes}
                           {...listeners}
                        >
                           <FontAwesomeIcon icon = {faCircleNotch} />
                        </div>
                        <div
                           className = "flex flex-col gap-2 pl-6 cursor-pointer"
                           {...doubleTap}
                        >
                           {set.weight !== null && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = {faDumbbell} />
                                 <p>{set.weight}</p>
                              </div>
                           )}
                           {set.repetitions !== null && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = {faArrowUp91} />
                                 <p>{set.repetitions}</p>
                              </div>
                           )}
                           {(set.hours !== null || set.minutes !== null || set.seconds !== null) && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = {faStopwatch} />
                                 <p>
                                    {String(set.hours ?? 0).padStart(2, "0")}:
                                    {String(set.minutes ?? 0).padStart(2, "0")}:
                                    {String(set.seconds ?? 0).padStart(2, "0")}
                                 </p>
                              </div>
                           )}
                           {set.text && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold text-md">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = {faAlignJustify} />
                                 <p>{set.text.trim()}</p>
                              </div>
                           )}
                        </div>
                     </li>
                  )
               )
         }
      </div>
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

   const collapsedId: string = `collapsed-${exercise.id}`;
   const [isCollapsed, setIsCollapsed] = useState(() => {
      return !!(localStorage.getItem(collapsedId));
   });
   const editingExerciseSetId: string = localState.exerciseId.data.setId;
   const displayEditName = editName && edit && id === exercise.id;

   useEffect(() => {
      // Save the collapsed state to localStorage whenever it changes
      if (isCollapsed) {
         localStorage.setItem(collapsedId, "true");
      } else {
         localStorage.removeItem(collapsedId);
      }
   }, [isCollapsed, collapsedId]);

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

   // Drag and drop for sets
   const sensors = useSensors(
      useSensor(TouchSensor),
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates
      })
   );

   const handleDragEnd = async(event) => {
      const { active, over } = event;

      if (active.id === editingExerciseSetId) {
         // Don't allow drag and drop for editing exercise sets
         return;
      }

      if (active.id !== over?.id) {
         let oldIndex: number, newIndex: number;

         for (const set of exercise.sets) {
            if (set.id === active.id) {
               // Original exercise set
               oldIndex = set.set_order;
            }

            if (set.id === over?.id) {
               // Swapping exercise set
               newIndex = set.set_order;
            }
         }

         if (oldIndex !== undefined && newIndex !== undefined) {
            // Reorder exercise sets and submit the appropriate changes
            const newExerciseSets: ExerciseSet[] = arrayMove(exercise.sets, oldIndex, newIndex).map((set, index) => {
               return {
                  ...set,
                  set_order: index
               };
            });

            const newExercise: Exercise = {
               ...exercise,
               sets: newExerciseSets
            };

            const response: VitalityResponse<Exercise> = await updateExercise(newExercise, "sets");

            const successMethod = () => {
               // Submit changes to global state using returned Exercise
               const newExercises: Exercise[] = [...workout.exercises].map((e) => e.id !== exercise.id ? e : response.body.data);
               saveExercises(newExercises);
            };

            handleResponse(localDispatch, response, successMethod, updateNotification);
         }
      }
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

      handleResponse(localDispatch, response, successMethod, updateNotification);
   }, [exercise, localDispatch, localState.name.value, saveExercises, updateNotification, workout.exercises]);

   const handleDeleteExercise = useCallback(async() => {
      const newExercises: Exercise[] = [...workout.exercises].filter((e) => e.id !== exercise.id);
      const response: VitalityResponse<Exercise[]> = await updateExercises(workout.id, newExercises);

      const successMethod = () => {
         // Update the overall workout exercises with new exercises from backend response
         saveExercises(response.body.data);
      };

      if (window.localStorage.getItem(collapsedId)) {
         // Remove from localStorage as the exercise no longer exists
         window.localStorage.removeItem(collapsedId);
      }

      handleResponse(localDispatch, response, successMethod, updateNotification);
   }, [exercise.id, localDispatch, saveExercises, updateNotification, workout.exercises, workout.id, collapsedId]);

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

   const handleReset = useCallback((setId: string) => {
      // Reset exercise inputs
      localDispatch({
         type: "updateStates",
         value: {
            exerciseId: {
               ...localState.exerciseId,
               value: exercise.id,
               data: {
                  setId: setId
               }
            },
            weight: {
               ...localState.weight,
               value: "",
               error: null
            },
            repetitions: {
               ...localState.repetitions,
               value: "",
               error: null
            },
            hours: {
               ...localState.hours,
               value: "",
               error: null
            },
            minutes: {
               ...localState.minutes,
               value: "",
               error: null
            },
            seconds: {
               ...localState.seconds,
               value: "",
               error: null
            },
            text: {
               ...localState.text,
               value: "",
               error: null
            }
         }
      });

      setAddSet(true);
   }, [exercise.id, localDispatch, localState.exerciseId, localState.hours, localState.minutes,
      localState.repetitions, localState.seconds, localState.text, localState.weight]);

   const doubleTap = useDoubleTap(handleInitializeEditExerciseName);

   return (
      <li
         className = "w-full mx-auto p-2 sm:p-4 text-left"
         style = {style}
         ref = {setNodeRef}
      >
         {
            displayEditName ? (
               <div>
                  <Input
                     id = "name"
                     type = "text"
                     label = "Name"
                     className = "mb-2"
                     icon = {faPenRuler}
                     input = {localState.name}
                     dispatch = {localDispatch}
                     onBlur = {() => setEditName(false)}
                     onSubmit = {() => handleSaveExerciseName()}
                     autoComplete = "none"
                     autoFocus
                     required />
                  <Button
                     type = "button"
                     className = "w-full bg-grey-200 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-blue-500 focus:ring-blue-500 text-red-500"
                     icon = {faRotateLeft}
                     onClick = {() => {
                        setEditName(false);
                     }}
                  >
                     Cancel
                  </Button>
                  <Button
                     type = "button"
                     className = "w-full bg-green-600 text-white text-md my-2 px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-blue-500 focus:ring-blue-500"
                     icon = {faPenRuler}
                     onClick = {handleSaveExerciseName}
                  >
                     Update
                  </Button>
                  <Conformation
                     message = "Delete this exercise?"
                     onConformation = {() => handleDeleteExercise()}
                  />
               </div>
            ) : (
               <h1 className = "cursor-default text-xl flex justify-start items-center">
                  <span>
                     <FontAwesomeIcon
                        className = "cursor-ns-resize hover:text-primary text-2xl pt-1"
                        icon = {isCollapsed ? faCaretRight : faCaretDown}
                        onClick = {() => setIsCollapsed(!(isCollapsed))}
                        {...attributes}
                        {...listeners}
                     />
                  </span>
                  <span
                     className = "cursor-pointer pl-4"
                     {...doubleTap}
                  >
                     {exercise.name}
                  </span>
               </h1>
            )
         }
         {
            !(isCollapsed) && (
               <div className = "flex flex-col justify-start items-start gap-4">
                  <DndContext
                     sensors = {sensors}
                     collisionDetection = {closestCenter}
                     onDragEnd = {handleDragEnd}
                  >
                     <SortableContext
                        items = {exercise.sets.map((set) => set.id)}
                        strategy = {verticalListSortingStrategy}>
                        <ul className = "w-full mx-auto list-disc text-black flex flex-col gap-6 pt-2">
                           {
                              exercise.sets.map((set: ExerciseSet) => {
                                 return (
                                    <SetContainer
                                       {...props}
                                       set = {set}
                                       reset = {() => handleReset(set.id)}
                                       onBlur = {() => { }}
                                       key = {set.id} />);
                              })
                           }
                           {
                              addSet && (
                                 <SetContainer
                                    {...props}
                                    set = {undefined}
                                    reset = {() => handleReset("")}
                                    onBlur = {() => setAddSet(false)} />
                              )
                           }
                        </ul>
                     </SortableContext>
                  </DndContext>
                  {
                     (
                        <div className = "w-full mx-auto mt-2 px-4 sm:px-8">
                           <Button
                              type = "button"
                              className = "w-full bg-white text-black text-md px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-blue-500 focus:ring-blue-500"
                              icon = {faPersonRunning}
                              onClick = {() => {
                                 handleReset("");
                                 setAddSet(true);
                              }}
                           >
                              New Entry
                           </Button>
                        </div>
                     )
                  }

               </div>
            )
         }
      </li>
   );
}

interface ExercisesProps extends VitalityProps {
   workout: Workout;
}

export default function Exercises(props: ExercisesProps): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const { workout, globalState, globalDispatch } = props;
   const [localState, localDispatch] = useReducer(formReducer, form);
   const [addExercise, setAddExercise] = useState(false);
   const id = localState.name.data.id;
   const edit = localState.name.data.id;

   const sensors = useSensors(
      useSensor(TouchSensor),
      useSensor(PointerSensor, {
         activationConstraint: {
            distance: 8
         }
      }),
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

   const handleDragEnd = async(event) => {
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
            // Reorder exercises and submit the appropriate changes
            const newExercises = arrayMove(exercises, oldIndex, newIndex).map((exercise, index) => ({
               ...exercise,
               exercise_order: index
            }));

            const response: VitalityResponse<Exercise[]> = await updateExercises(workout.id, newExercises);

            const successMethod = () => {
               handleSaveExercises(newExercises);
            };

            handleResponse(localDispatch, response, successMethod, updateNotification);
         }
      }
   };

   return (
      <div className = "w-full mx-auto text-center font-bold flex flex-col justify-center items-center">
         <hr className = "text-black w-full my-2" />
         <DndContext
            sensors = {sensors}
            collisionDetection = {closestCenter}
            onDragEnd = {handleDragEnd}
         >
            <SortableContext
               items = {exercises.map((exercise) => exercise.id)}
               strategy = {verticalListSortingStrategy}>
               <ol className = "w-full mx-auto">
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
         <div className = "w-full mx-auto my-2">
            {
               displayNewName ? (
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
               ) : (
                  <div className = "w-full mx-auto">
                     <Button
                        type = "button"
                        className = "w-full bg-white text-black px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-blue-500 focus:ring-blue-500"
                        icon = {faPlus}
                        onClick = {handleInitializeNewExerciseInput}
                     >
                        New Exercise
                     </Button>
                  </div>

               )
            }
         </div>
      </div>
   );
}