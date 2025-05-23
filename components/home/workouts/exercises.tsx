"use client";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { faArrowRotateLeft, faCaretDown, faCaretRight, faPenNib, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { useDoubleTap } from "use-double-tap";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Confirmation from "@/components/global/confirmation";
import { Input } from "@/components/global/input";
import ExerciseEntryContainer from "@/components/home/workouts/entries";
import { formReducer, VitalityChildProps, VitalityProps, VitalityState } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { addExercise, Exercise, ExerciseEntry, updateExercise, updateExercises } from "@/lib/home/workouts/exercises";
import { Workout } from "@/lib/home/workouts/workouts";

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

   const createExercise = useCallback(async() => {
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
      onBlur,
      workout.id,
      localDispatch,
      saveExercises,
      workout.exercises,
      updateNotifications,
      localState.name.value
   ]);

   const submitCreateExerciseUpdates = useCallback(() => {
      createButtonRef.current?.submit();
   }, []);

   return (
      <div className = "relative mt-8 flex w-full flex-col items-stretch justify-center gap-2 text-left">
         <FontAwesomeIcon
            icon = { faArrowRotateLeft }
            onClick = {
               () => {
                  // Prevent resetting the exercise name during a submission
                  if (document.getElementById("name")?.getAttribute("disabled") === "true") return;

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
            className = "absolute right-[10px] top-[-27px] z-10 cursor-pointer text-xl text-red-500"
            onClick = {
               () => {
                  // Prevent closing the exercise name input during a submission
                  if (document.getElementById("name")?.getAttribute("disabled") === "true") return;

                  onBlur();
               }
            }
         />
         <Input
            id = "name"
            type = "text"
            label = "Name"
            icon = { faPenNib }
            input = { localState.name }
            dispatch = { localDispatch }
            onSubmit = { submitCreateExerciseUpdates }
            autoComplete = "none"
            autoFocus
            scrollIntoView
            required
         />
         <Button
            ref = { createButtonRef }
            type = "button"
            className = "h-10 w-full border-[1.5px] border-gray-100 bg-green-500 px-4 py-2 font-bold text-white focus:border-green-600 focus:ring-2 focus:ring-green-600 dark:border-0"
            icon = { faPenNib }
            onSubmit = { createExercise }
            onClick = { submitCreateExerciseUpdates }
            isSingleSubmission = { true }
            inputIds = { ["name"] }
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
   const [addEntry, setAddEntry] = useState<boolean>(false);
   const [isCollapsed, setIsCollapsed] = useState<boolean>(!!window.localStorage.getItem(`collapsed-${exercise.id}`));
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   // Interning editing exercise name input
   const collapsedId: string = `collapsed-${exercise.id}`;
   const editingExerciseId: string = localState.exerciseId.value;
   const editingEntryId: string = localState.exerciseId.data?.entryId;
   const displayEditNameInput = editing && editName && exercise.id === id;
   const hideNewEntryButton = addEntry && exercise.id === editingExerciseId && editingEntryId === "";

   useEffect(() => {
      // Save collapsed state of exercise listing into localStorage
      isCollapsed ?
         window.localStorage.setItem(collapsedId, "true") : window.localStorage.removeItem(collapsedId);
   }, [
      isCollapsed,
      collapsedId
   ]);

   // Prevent drag and drop mechanisms when editing an exercise name or adding a new entry or if there is only one exercise
   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: exercise.id,
      disabled: displayEditNameInput || addEntry || workout.exercises.length === 1
   });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition
   };

   // Drag and drop for exercise entries
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

         for (const entry of exercise.entries) {
            if (entry.id === active.id) {
               // Original exercise entry
               oldIndex = entry.entry_order;
            }

            if (entry.id === over?.id) {
               // Swapping exercise entry
               newIndex = entry.entry_order;
            }
         }

         if (oldIndex !== undefined && newIndex !== undefined) {
            // Optimistic ordering update as ordering is not critical
            const newExercise: Exercise = {
               ...exercise,
               entries: arrayMove(exercise.entries, oldIndex, newIndex).map(
                  (entry, index) => ({ ...entry, entry_order: index })
               )
            };

            const newExercises: Exercise[] = [...workout.exercises].map(
               (e) => e.id === exercise.id ? newExercise : e,
            );

            saveExercises(newExercises);

            updateExercise(
               user.id,
               newExercise,
               "entries",
            );
         }
      }
   };

   const updateExerciseName = useCallback(async() => {
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
         setEditName(false);
      });
   }, [
      user,
      exercise,
      saveExercises,
      localDispatch,
      workout.exercises,
      updateNotifications,
      localState.name.value
   ]);

   const submitExerciseNameUpdates = useCallback(() => {
      updateButtonRef.current?.submit();
   }, []);

   const deleteExercise = useCallback(async() => {
      const newWorkout = {
         ...workout,
         exercises: [...workout.exercises].filter(
            (e) => e.id !== exercise.id,
         )
      };

      const response: VitalityResponse<Exercise[]> = await updateExercises(user.id, newWorkout);

      processResponse(response, localDispatch, updateNotifications, () => {
         // Update the overall workout exercises from backend response data
         saveExercises(response.body.data as Exercise[]);

         // Remove from localStorage as the exercise no longer exists
         window.localStorage.getItem(collapsedId) && window.localStorage.removeItem(collapsedId);
      });
   }, [
      user,
      workout,
      collapsedId,
      exercise.id,
      localDispatch,
      saveExercises,
      updateNotifications
   ]);

   const displayEditExerciseName = useCallback(() => {
      // Prevent editing exercise name during a submission
      if (document.getElementById("name")?.getAttribute("disabled") === "true") return;

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
      localDispatch,
      exercise.name
   ]);

   const resetExerciseEntry = useCallback((entryId: string) => {
      // Prevent resetting entry inputs during a submission
      if (document.getElementById("weight")?.getAttribute("disabled") === "true") return;

      // Reset exercise entry inputs
      localDispatch({
         type: "updateStates",
         value: {
            exerciseId: {
               value: exercise.id,
               data: {
                  entryId: entryId
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

      setAddEntry(true);
   }, [
      exercise.id,
      localDispatch
   ]);

   const doubleTap = useDoubleTap(displayEditExerciseName);

   return (
      <li
         className = "mx-auto w-full p-2 text-left"
         style = { style }
         ref = { setNodeRef }
      >
         {
            displayEditNameInput ? (
               <div className = "relative mt-8">
                  <FontAwesomeIcon
                     icon = { faArrowRotateLeft }
                     onClick = {
                        () => {
                           // Prevent resetting the exercise name during a submission
                           if (document.getElementById("name")?.getAttribute("disabled") === "true") return;

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
                     className = "absolute right-[35px] top-[-25px] z-10 cursor-pointer text-base text-primary"
                  />
                  <FontAwesomeIcon
                     icon = { faXmark }
                     className = "absolute right-[10px] top-[-27px] z-10 cursor-pointer text-xl text-red-500"
                     onClick = {
                        () => {
                        // Prevent closing the exercise name input during a submission
                           if (document.getElementById("name")?.getAttribute("disabled") === "true") return;

                           setEditName(false);
                        }
                     }
                  />
                  <Input
                     id = "name"
                     type = "text"
                     label = "Name"
                     className = "mb-2"
                     icon = { faPenNib }
                     input = { localState.name }
                     dispatch = { localDispatch }
                     onSubmit = { submitExerciseNameUpdates }
                     autoComplete = "none"
                     autoFocus
                     scrollIntoView
                     required
                  />
                  <Button
                     ref = { updateButtonRef }
                     type = "button"
                     className = "my-2 h-10 w-full border-[1.5px] border-gray-100 bg-green-500 px-4 py-2 text-base font-bold text-white focus:border-green-600 focus:ring-2 focus:ring-green-600 dark:border-0"
                     icon = { faPenNib }
                     onSubmit = { updateExerciseName }
                     onClick = { submitExerciseNameUpdates }
                     inputIds = { ["name"] }
                  >
                     Update
                  </Button>
                  <Confirmation
                     isDisabled = { () => document.getElementById("name")?.getAttribute("disabled") === "true" }
                     message = "Delete exercise?"
                     onConfirmation = { deleteExercise }
                  />
               </div>
            ) : (
               <h1 className = "flex cursor-default flex-row flex-nowrap items-center justify-start gap-4">
                  <span>
                     <FontAwesomeIcon
                        className = {
                           clsx("cursor-default touch-none pt-[2px] text-2xl focus:outline-none", {
                              "cursor-grab": workout.exercises.length > 1,
                              "cursor-pointer": workout.exercises.length === 1
                           })
                        }
                        icon = { isCollapsed ? faCaretRight : faCaretDown }
                        onClick = { () => setIsCollapsed(!isCollapsed) }
                        aria-hidden = { false }
                        { ...attributes }
                        { ...listeners }
                     />
                  </span>
                  <span
                     className = "cursor-pointer overflow-x-auto whitespace-nowrap text-[1.2rem] xxsm:text-xl"
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
                        items = { exercise.entries.map((entry) => entry.id) }
                        strategy = { verticalListSortingStrategy }
                     >

                        <ul
                           className = {
                              clsx("mx-auto my-1 flex w-full list-disc flex-col gap-2", {
                                 "hidden" : exercise.entries.length === 0 && !addEntry
                              })
                           }
                        >
                           {
                              exercise.entries.map((entry: ExerciseEntry) => {
                                 return (
                                    <ExerciseEntryContainer
                                       { ...props }
                                       entry = { entry }
                                       onBlur = { undefined }
                                       key = { entry.id }
                                       reset = { () => resetExerciseEntry(entry.id) }
                                    />
                                 );
                              })
                           }
                           {
                              addEntry && (
                                 <ExerciseEntryContainer
                                    { ...props }
                                    entry = { undefined }
                                    onBlur = { () => setAddEntry(false) }
                                    reset = { () => resetExerciseEntry("") }
                                 />
                              )
                           }
                        </ul>
                     </SortableContext>
                  </DndContext>
                  {
                     !hideNewEntryButton && (
                        <div className = "mx-auto mt-4 w-full px-2 xsm:px-8">
                           <Button
                              type = "button"
                              className = "h-10 w-full border-[1.5px] border-gray-100 px-4 py-2 font-bold focus:border-blue-500 focus:ring-blue-500 dark:border-0 dark:bg-gray-700/50"
                              icon = { faPlus }
                              onClick = {
                                 () => {
                                    // Prevent closing the existing exercise entry input during a submission
                                    if (document.getElementById("weight")?.getAttribute("disabled") === "true") return;

                                    resetExerciseEntry("");
                                    setAddEntry(true);
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
   const { user } = useContext(AuthenticationContext);
   const { workout, globalState, globalDispatch } = props;
   const [localState, localDispatch] = useReducer(formReducer, form);
   const [addExercise, setAddExercise] = useState<boolean>(false);
   const { editing } = localState.name.data;

   const displayNewExerciseInput: boolean = addExercise && !editing;
   const exercises: Exercise[] = workout.exercises;

   const displayNewExercise = useCallback(() => {
      // Prevent closing the existing exercise name input during a submission
      if (document.getElementById("name")?.getAttribute("disabled") === "true") return;

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

   const saveExercises = useCallback(async(updatingExercises: Exercise[]) => {
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
      workout,
      globalDispatch,
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
            // Optimistic ordering update as ordering is not critical
            const newWorkout = {
               ...workout,
               exercises: arrayMove(exercises, oldIndex, newIndex).map(
                  (exercise, index) => ({ ...exercise, exercise_order: index })
               )
            };

            saveExercises(newWorkout.exercises);
            updateExercises(user.id, newWorkout);
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
                              saveExercises = { saveExercises }
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
               displayNewExerciseInput ? (
                  <CreateExercise
                     { ...props }
                     localState = { localState }
                     localDispatch = { localDispatch }
                     exercise = { null }
                     saveExercises = { saveExercises }
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
                        onClick = { displayNewExercise }
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