"use client";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { faAlignJustify, faArrowRotateLeft, faArrowUp91, faCaretDown, faCaretRight, faCircleNotch, faDumbbell, faListCheck, faPersonRunning, faPlus, faStopwatch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { useDoubleTap } from "use-double-tap";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Confirmation from "@/components/global/confirmation";
import { Input } from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import { formReducer, VitalityChildProps, VitalityProps, VitalityState } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { addExercise, Exercise, ExerciseEntry, isEmptyExerciseEntry, updateExercise, updateExercises } from "@/lib/home/workouts/exercises";
import { Workout } from "@/lib/home/workouts/workouts";
import ExerciseEntryContainer from "@/components/home/workouts/entries";

const form: VitalityState = {
   name: {
      id: "name",
      value: "",
      error: null,
      data: {
         id: "",
         editing: false
      }
   },
   weight: {
      id: "weight",
      value: "",
      error: null,
      data: {}
   },
   repetitions: {
      id: "repetitions",
      value: "",
      error: null
   },
   hours: {
      id: "hours",
      value: "",
      error: null
   },
   minutes: {
      id: "minutes",
      value: "",
      error: null
   },
   seconds: {
      id: "seconds",
      value: "",
      error: null
   },
   text: {
      id: "text",
      value: "",
      error: null
   },
   exerciseId: {
      id: "exerciseId",
      value: null,
      error: null,
      data: {
         entryId: ""
      }
   }
};

function CreateExercise(props: ExerciseProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { workout, localState, localDispatch, saveExercises, onBlur } = props;
   const createButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const handleCreateNewExercise = useCallback(async() => {
      const payload: Exercise = {
         id: "",
         workout_id: workout.id,
         name: localState.name.value.trim(),
         exercise_order: workout.exercises.length,
         entries: []
      };

      const response: VitalityResponse<Exercise> = await addExercise(user.id, payload);

      processResponse(response, localDispatch, updateNotifications, () => {
         const newExercises: Exercise[] = [...workout.exercises, response.body.data as Exercise];
         saveExercises(newExercises);
         onBlur();
      });
   }, [
      user,
      localDispatch,
      localState.name.value,
      saveExercises,
      updateNotifications,
      workout.exercises,
      workout.id,
      onBlur
   ]);

   const handleSubmitCreation = useCallback(() => {
      createButtonRef.current?.submit();
   }, []);

   return (
      <div className = "relative mt-8 flex w-full flex-col items-stretch justify-center gap-2 text-left">
         <FontAwesomeIcon
            icon = { faArrowRotateLeft }
            onClick = {
               () => {
                  localDispatch({
                     type: "updateState",
                     value: {
                        id: "name",
                        value: {
                           value: "",
                           error: null
                        }
                     }
                  });
               }
            }
            className = "absolute right-[35px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-primary"
         />
         <FontAwesomeIcon
            icon = { faXmark }
            className = "absolute right-[10px] top-[-27px] z-10 size-4 shrink-0 cursor-pointer text-xl text-red-500"
            onClick = {
               () => {
                  onBlur();
               }
            }
         />
         <Input
            id = "name"
            type = "text"
            label = "Name"
            icon = { faDumbbell }
            input = { localState.name }
            dispatch = { localDispatch }
            onSubmit = { handleSubmitCreation }
            autoComplete = "none"
            autoFocus
            scrollIntoView
            required
         />
         <Button
            ref = { createButtonRef }
            type = "button"
            className = "h-10 w-full border-[1.5px] border-gray-100 bg-green-500 px-4 py-2 font-bold text-white focus:border-green-600 focus:ring-2 focus:ring-green-600 dark:border-0"
            icon = { faDumbbell }
            onSubmit = { handleCreateNewExercise }
            onClick = { handleSubmitCreation }
            isSingleSubmission = { true }
         >
            Create
         </Button>
      </div>
   );
}

export interface ExerciseProps extends ExercisesProps, VitalityChildProps {
   exercise: Exercise;
   onBlur?: () => void;
   saveExercises: (_updatingExercises: Exercise[]) => void;
}

function ExerciseContainer(props: ExerciseProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { workout, exercise, localState, localDispatch, saveExercises } = props;
   const { id, editing } = localState.name.data;
   const [editName, setEditName] = useState<boolean>(false);
   const [addSet, setAddSet] = useState<boolean>(false);
   const [isCollapsed, setIsCollapsed] = useState<boolean>(!!window.localStorage.getItem(`collapsed-${exercise.id}`));
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   // Interning editing exercise name input
   const collapsedId: string = `collapsed-${exercise.id}`;
   const editingExerciseId: string = localState.exerciseId.value;
   const editingSetId: string = localState.exerciseId.data?.setId;
   const displayEditName = editing && editName && exercise.id === id;
   const hideNewSetButton = addSet && exercise.id === editingExerciseId && editingSetId === "";

   useEffect(() => {
      // Save collapsed state of exercise into localStorage
      isCollapsed ? window.localStorage.setItem(collapsedId, "true") : window.localStorage.removeItem(collapsedId);
   }, [
      isCollapsed,
      collapsedId
   ]);

   // Prevent drag and drop mechanisms when editing an exercise name or adding a set
   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: exercise.id,
      disabled: displayEditName || addSet
   });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition
   };

   // Drag and drop for exercise sets
   const sensors = useSensors(
      useSensor(TouchSensor),
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates
      }),
   );

   const handleDragEnd = async(event) => {
      const { active, over } = event;

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
            // Reorder exercise sets for the current exercise
            const newExercise: Exercise = {
               ...exercise,
               sets: arrayMove(exercise.sets, oldIndex, newIndex).map(
                  (set, index) => ({ ...set, set_order: index })
               )
            };

            const response: VitalityResponse<Exercise> = await updateExercise(
               user.id,
               newExercise,
               "sets",
            );

            processResponse(response, localDispatch, updateNotifications, () => {
               // Submit changes to global state from response data
               const newExercises: Exercise[] = [...workout.exercises].map(
                  (e) => e.id === exercise.id ? response.body.data as Exercise : e,
               );

               saveExercises(newExercises);
            });
         }
      }
   };

   const handleUpdateExerciseName = useCallback(async() => {
      const newExercise: Exercise = {
         ...exercise,
         name: localState.name.value.trim()
      };

      processResponse(await updateExercise(user.id, newExercise, "name"), localDispatch, updateNotifications, () => {
         // Update the overall workout exercises
         const newExercises: Exercise[] = [...workout.exercises].map((e) =>
            e.id !== exercise.id ? e : newExercise,
         );

         saveExercises(newExercises);
      });
   }, [
      user,
      exercise,
      localDispatch,
      localState.name.value,
      saveExercises,
      updateNotifications,
      workout.exercises
   ]);

   const handleSubmitUpdates = useCallback(() => {
      updateButtonRef.current?.submit();
   }, []);

   const handleDeleteExercise = useCallback(async() => {
      const newWorkout = {
         ...workout,
         exercises: [...workout.exercises].filter(
            (e) => e.id !== exercise.id,
         )
      };

      const response: VitalityResponse<Exercise[]> = await updateExercises(newWorkout);

      processResponse(response, localDispatch, updateNotifications, () => {
         // Update the overall workout exercises from backend response data
         saveExercises(response.body.data as Exercise[]);
         updateNotifications({
            status: "Success",
            message: "Delete exercise",
            timer: 1000
         });

         // Remove from localStorage as the exercise no longer exists
         window.localStorage.getItem(collapsedId) && window.localStorage.removeItem(collapsedId);
      });
   }, [
      workout,
      exercise.id,
      localDispatch,
      saveExercises,
      updateNotifications,
      collapsedId
   ]);

   const handleDisplayEditName = useCallback(() => {
      // Update exercise name inputs
      localDispatch({
         type: "updateState",
         value: {
            id: "name",
            value: {
               value: exercise.name,
               error: null,
               data: {
                  editing: true,
                  id: exercise.id
               }
            }
         }
      });

      setEditName(true);
   }, [
      exercise.id,
      exercise.name,
      localDispatch
   ]);

   const handleResetExerciseSet = useCallback((setId: string) => {
      // Reset exercise set inputs
      localDispatch({
         type: "updateStates",
         value: {
            exerciseId: {
               value: exercise.id,
               data: {
                  setId: setId
               }
            },
            weight: {
               value: "",
               error: null
            },
            repetitions: {
               value: "",
               error: null
            },
            hours: {
               value: "",
               error: null
            },
            minutes: {
               value: "",
               error: null
            },
            seconds: {
               value: "",
               error: null
            },
            text: {
               value: "",
               error: null
            }
         }
      });

      setAddSet(true);
   }, [
      exercise.id,
      localDispatch
   ]);

   const doubleTap = useDoubleTap(handleDisplayEditName);

   return (
      <li
         className = "mx-auto w-full p-2 text-left"
         style = { style }
         ref = { setNodeRef }
      >
         {
            displayEditName ? (
               <div className = "relative mt-8">
                  <FontAwesomeIcon
                     icon = { faArrowRotateLeft }
                     onClick = {
                        () => {
                           localDispatch({
                              type: "updateState",
                              value: {
                                 id: "name",
                                 value: {
                                    value: "",
                                    error: null
                                 }
                              }
                           });
                        }
                     }
                     className = "absolute right-[35px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-primary"
                  />
                  <FontAwesomeIcon
                     icon = { faXmark }
                     className = "absolute right-[10px] top-[-27px] z-10 size-4 shrink-0 cursor-pointer text-xl text-red-500"
                     onClick = { () => setEditName(false) }
                  />
                  <Input
                     id = "name"
                     type = "text"
                     label = "Name"
                     className = "mb-2"
                     icon = { faListCheck }
                     input = { localState.name }
                     dispatch = { localDispatch }
                     onSubmit = { handleSubmitUpdates }
                     autoComplete = "none"
                     autoFocus
                     scrollIntoView
                     required
                  />
                  <Button
                     ref = { updateButtonRef }
                     type = "button"
                     className = "my-2 h-10 w-full border-[1.5px] border-gray-100 bg-green-500 px-4 py-2 text-base font-bold text-white focus:border-green-600 focus:ring-2 focus:ring-green-600 dark:border-0"
                     icon = { faListCheck }
                     onSubmit = { handleUpdateExerciseName }
                     onClick = { handleSubmitUpdates }
                  >
                     Update
                  </Button>
                  <Confirmation
                     message = "Delete exercise?"
                     onConfirmation = { handleDeleteExercise }
                  />
               </div>
            ) : (
               <h1 className = "flex cursor-default items-center justify-start text-lg xxsm:text-xl">
                  <span>
                     <FontAwesomeIcon
                        className = "cursor-grab touch-none pt-1 text-2xl focus:outline-none"
                        icon = { isCollapsed ? faCaretRight : faCaretDown }
                        onClick = { () => setIsCollapsed(!isCollapsed) }
                        { ...attributes }
                        { ...listeners }
                     />
                  </span>
                  <span
                     className = "cursor-pointer whitespace-pre-wrap pl-4 [overflow-wrap:anywhere]"
                     { ...doubleTap }
                  >
                     { exercise.name }
                  </span>
               </h1>
            )
         }
         {
            !isCollapsed && (
               <div className = "flex flex-col items-start justify-start">
                  <DndContext
                     sensors = { sensors }
                     collisionDetection = { closestCenter }
                     onDragEnd = { handleDragEnd }
                  >

                     <SortableContext
                        items = { exercise.sets.map((set) => set.id) }
                        strategy = { verticalListSortingStrategy }
                     >

                        <ul
                           className = {
                              clsx("mx-auto my-1 flex w-full list-disc flex-col gap-2", {
                                 "hidden" : exercise.entries.length === 0 && !addSet
                              })
                           }
                        >
                           {
                              exercise.entries.map((set: ExerciseSet) => {
                                 return (
                                    <ExerciseEntryContainer
                                       { ...props }
                                       entry = { set }
                                       onBlur = { () => {} }
                                       key = { set.id }
                                       reset = { () => handleResetExerciseSet(set.id) }
                                    />
                                 );
                              })
                           }
                           {
                              addSet && (
                                 <ExerciseEntryContainer
                                    { ...props }
                                    entry = { undefined }
                                    onBlur = { () => setAddSet(false) }
                                    reset = { () => handleResetExerciseSet("") }
                                 />
                              )
                           }
                        </ul>
                     </SortableContext>
                  </DndContext>
                  {
                     !hideNewSetButton && (
                        <div className = "mx-auto mt-4 w-full px-2 xsm:px-8">
                           <Button
                              type = "button"
                              className = "h-10 w-full border-[1.5px] border-gray-100 px-4 py-2 font-bold focus:border-blue-500 focus:ring-blue-500 dark:border-0 dark:bg-gray-700/50"
                              icon = { faPlus }
                              onClick = {
                                 () => {
                                    handleResetExerciseSet("");
                                    setAddSet(true);
                                 }
                              }
                           >
                              Entry
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
   const { updateNotifications } = useContext(NotificationContext);
   const { workout, globalState, globalDispatch } = props;
   const [localState, localDispatch] = useReducer(formReducer, form);
   const [addExercise, setAddExercise] = useState<boolean>(false);
   const { editing } = localState.name.data;

   const displayNewExercise: boolean = addExercise && !editing;
   const exercises: Exercise[] = workout.exercises;

   const handleDisplayNewExercise = useCallback(() => {
      // Update exercise name inputs
      localDispatch({
         type: "updateState",
         value: {
            id: "name",
            value: {
               value: "",
               error: null,
               data: {
                  id: "",
                  editing: false
               }
            }
         }
      });

      setAddExercise(true);
   }, [localDispatch]);

   const handleSaveExercises = useCallback(async(updatingExercises: Exercise[]) => {
      // Update editing workout and overall workouts
      const newWorkout: Workout = {
         ...workout,
         exercises: updatingExercises
      };
      const newWorkouts: Workout[] = [...globalState.workouts.value].map(
         (workout) => workout.id === newWorkout.id ? newWorkout : workout
      );
      const newFiltered: Workout[] = [...globalState.workouts.data?.filtered].map(
         (workout) => (workout.id === newWorkout.id ? newWorkout : workout)
      );

      globalDispatch({
         type: "updateStates",
         value: {
            workout: {
               value: newWorkout
            },
            workouts: {
               value: newWorkouts,
               data: {
                  filtered: newFiltered
               }
            }
         }
      });

      setAddExercise(false);
   }, [
      globalDispatch,
      workout,
      globalState.workouts.value,
      globalState.workouts.data?.filtered
   ]);

   // Drag and drop for exercises
   const sensors = useSensors(
      useSensor(TouchSensor),
      useSensor(PointerSensor, {
         activationConstraint: {
            distance: 8
         }
      }),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates
      }),
   );

   const handleDragEnd = async(event) => {
      const { active, over } = event;

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
            const newWorkout = {
               ...workout,
               exercises: arrayMove(exercises, oldIndex, newIndex).map(
                  (exercise, index) => ({ ...exercise, exercise_order: index })
               )
            };

            const response: VitalityResponse<Exercise[]> = await updateExercises(newWorkout);

            processResponse(response, localDispatch, updateNotifications, () => {
               handleSaveExercises(response.body.data as Exercise[]);
            });
         }
      }
   };

   return (
      <div className = "mx-auto flex w-full flex-col items-center justify-center text-center font-bold">
         <hr className = "my-2 w-full text-black" />
         <DndContext
            sensors = { sensors }
            collisionDetection = { closestCenter }
            onDragEnd = { handleDragEnd }
         >
            <SortableContext
               items = { exercises.map((exercise) => exercise.id) }
               strategy = { verticalListSortingStrategy }
            >
               <ol className = "mx-auto w-full">
                  {
                     exercises.map((exercise: Exercise) => {
                        return (
                           <ExerciseContainer
                              { ...props }
                              localState = { localState }
                              localDispatch = { localDispatch }
                              saveExercises = { handleSaveExercises }
                              exercise = { exercise }
                              key = { exercise.id }
                           />
                        );
                     })
                  }
               </ol>
            </SortableContext>
         </DndContext>
         <div className = "mx-auto my-2 w-full">
            {
               displayNewExercise ? (
                  <CreateExercise
                     { ...props }
                     localState = { localState }
                     localDispatch = { localDispatch }
                     exercise = { null }
                     saveExercises = { handleSaveExercises }
                     onBlur = {
                        () => {
                           setAddExercise(false);
                        }
                     }
                  />
               ) : (
                  <div className = "mx-auto w-full">
                     <Button
                        type = "button"
                        className = "h-10 w-full border-[1.5px] border-gray-100 px-4 py-2 font-bold focus:border-blue-500 focus:ring-blue-500 dark:border-0 dark:bg-gray-700/50"
                        icon = { faPlus }
                        onClick = { handleDisplayNewExercise }
                     >
                        Exercise
                     </Button>
                  </div>
               )
            }
         </div>
      </div>
   );
}