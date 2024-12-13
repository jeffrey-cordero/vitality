"use client";
import Button from "@/components/global/button";
import TextArea from "@/components/global/textarea";
import Confirmation from "@/components/global/confirmation";
import { Input } from "@/components/global/input";
import { VitalityChildProps, VitalityProps, VitalityState, formReducer } from "@/lib/global/state";
import { handleResponse, VitalityResponse } from "@/lib/global/response";
import { Workout } from "@/lib/home/workouts/workouts";
import { faAlignJustify, faArrowRotateLeft, faArrowUp91, faDumbbell, faStopwatch, faCaretRight, faCaretDown, faCircleNotch, faXmark, faPen, faBook } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useContext, useEffect, useReducer, useState } from "react";
import { addExercise, updateExercise, Exercise, ExerciseSet, updateExercises } from "@/lib/home/workouts/exercises";
import { NotificationContext } from "@/app/layout";
import { useDoubleTap } from "use-double-tap";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, TouchSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

const form: VitalityState = {
   name: {
      value: "",
      error: null,
      data: {
         id: "",
         editing: false
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

function CreateExercise(props: ExerciseProps): JSX.Element {
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

      handleResponse(response, localDispatch, updateNotification, () => {
         // Add the new exercise to editing workout array of exercises
         const newExercises: Exercise[] = [
            ...workout.exercises,
            response.body.data as Exercise
         ];
         saveExercises(newExercises);
         onBlur();

         updateNotification({
            status: "Success",
            message: "Added exercise",
            timer: 1000
         });
      });
   }, [
      localDispatch,
      localState.name.value,
      saveExercises,
      updateNotification,
      workout.exercises,
      workout.id,
      onBlur
   ]);

   return (
      <div className = "relative mt-8 flex w-full flex-col items-stretch justify-center gap-2 text-left">
         <FontAwesomeIcon
            icon = { faArrowRotateLeft }
            onClick = {
               () => {
                  localDispatch({
                     type: "updateState",
                     value: {
                        input: {
                           ...localState.name,
                           value: "",
                           error: null
                        },
                        id: "name"
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
            onSubmit = { () => handleCreateNewExercise() }
            autoComplete = "none"
            autoFocus
            scrollIntoView
            required
         />
         <Button
            type = "button"
            className = "h-[2.4rem] w-full border-[1.5px] border-gray-100 bg-green-600 px-4 py-2 font-bold text-white focus:border-green-800 focus:ring-2 focus:ring-green-800 dark:border-0"
            icon = { faDumbbell }
            onClick = { handleCreateNewExercise }
         >
            Create
         </Button>
      </div>
   );
}

interface ExerciseSetProps extends ExerciseProps {
   set: ExerciseSet | undefined;
   reset: () => void;
}

function SetContainer(props: ExerciseSetProps): JSX.Element {
   const {
      workout,
      exercise,
      set,
      localState,
      localDispatch,
      onBlur,
      reset,
      saveExercises
   } = props;
   const { updateNotification } = useContext(NotificationContext);
   const [editSet, setEditSet] = useState(set === undefined);

   // Determines if interning exercise set inputs should be displayed
   const editingExerciseId: string = localState.exerciseId.value;
   const editingExerciseSetId: string = localState.exerciseId.data.setId;
   const displayEditInputs =
      editSet &&
      editingExerciseId === exercise.id &&
      ((set === undefined && editingExerciseSetId === "") ||
         set?.id === editingExerciseSetId);

   // Prevent drag and drop mechanisms when creating or editing a set
   const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({
         id: set?.id,
         disabled: set === undefined || displayEditInputs
      });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition
   };

   const handleExerciseSetConstruction = useCallback(() => {
      // Construct exercise set with valid numeric inputs for backend payload
      const parseNumber = (value: any) => {
         const isEmpty: boolean = typeof value === "string"
            && value.trim().length === 0;
         const num: number = +value;

         return (isEmpty || isNaN(num) || num < 0) ? null : num;
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
         text: localState.text.value.trim()
      };
   }, [
      set,
      exercise.id,
      exercise.sets.length,
      localState.hours.value,
      localState.minutes.value,
      localState.repetitions.value,
      localState.seconds.value,
      localState.text.value,
      localState.weight.value
   ]);

   const handleExerciseSetUpdates = useCallback(
      async(method: "update" | "delete") => {
         const newSet: ExerciseSet = handleExerciseSetConstruction();
         let response: VitalityResponse<Exercise>;

         if (set === undefined) {
            // Add new set to array of exercise sets
            const newSets: ExerciseSet[] = [...exercise.sets, newSet];
            const newExercise: Exercise = {
               ...exercise,
               sets: newSets
            };

            response = await updateExercise(newExercise, "sets");
         } else {
            // Update or delete set from array of exercise sets
            const newSets: ExerciseSet[] =
               method === "update"
                  ? [...exercise.sets].map((s) => (s.id === newSet.id ? newSet : s))
                  : [...exercise.sets].filter((s) => s.id !== newSet.id);
            const newExercise: Exercise = {
               ...exercise,
               sets: newSets
            };

            response = await updateExercise(newExercise, "sets");
         }

         handleResponse(response, localDispatch, updateNotification, () => {
            // Update editing exercise
            const newExercises: Exercise[] = [...workout.exercises].map((e) =>
               e.id === exercise.id ? response.body.data as Exercise : e,
            );

            saveExercises(newExercises);
            setEditSet(false);
            onBlur();

            updateNotification({
               status: "Success",
               message: `${set === undefined ? "Added" : method === "update" ? "Updated" : "Deleted"} exercise set`,
               timer: 1000
            });
         });
      },
      [
         set,
         exercise,
         handleExerciseSetConstruction,
         localDispatch,
         saveExercises,
         updateNotification,
         workout.exercises,
         onBlur
      ],
   );

   const handleExerciseSetEdits = useCallback(() => {
      // Update inputs to match set props
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
   }, [
      exercise.id,
      localDispatch,
      localState.exerciseId,
      localState.hours,
      localState.minutes,
      localState.repetitions,
      localState.seconds,
      localState.text,
      localState.weight,
      set?.hours,
      set?.id,
      set?.minutes,
      set?.repetitions,
      set?.seconds,
      set?.text,
      set?.weight
   ]);

   const doubleTap = useDoubleTap(handleExerciseSetEdits);

   return (
      <div
         ref = { setNodeRef }
         style = { style }
         className = "mx-auto w-full"
      >
         {
            displayEditInputs ? (
               <li className = "relative mx-auto mt-10 flex w-full flex-col items-stretch justify-start gap-2 px-2 text-center font-medium sm:px-8">
                  <FontAwesomeIcon
                     icon = { faArrowRotateLeft }
                     onClick = { reset }
                     className = "absolute right-[35px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer pr-2 text-base text-primary sm:pr-8"
                  />
                  <FontAwesomeIcon
                     icon = { faXmark }
                     className = "absolute right-[10px] top-[-27px] z-10 size-4 shrink-0 cursor-pointer pr-2 text-xl text-red-500 sm:pr-8"
                     onClick = {
                        () => {
                           if (set === undefined) {
                              // Remove from DOM for new exercise set inputs
                              onBlur();
                           }

                           setEditSet(false);
                        }
                     }
                  />

                  <Input
                     id = "weight"
                     type = "number"
                     label = "Weight"
                     min = "0"
                     icon = { faDumbbell }
                     input = { localState.weight }
                     dispatch = { localDispatch }
                     onSubmit = { () => handleExerciseSetUpdates("update") }
                  />
                  <Input
                     id = "repetitions"
                     type = "number"
                     label = "Repetitions"
                     min = "0"
                     icon = { faArrowUp91 }
                     input = { localState.repetitions }
                     dispatch = { localDispatch }
                     onSubmit = { () => handleExerciseSetUpdates("update") }
                  />
                  <div className = "flex flex-col items-start justify-between gap-2 sm:flex-row">
                     <div className = "mx-auto w-full">
                        <Input
                           id = "hours"
                           type = "number"
                           label = "Hours"
                           min = "0"
                           icon = { faStopwatch }
                           input = { localState.hours }
                           dispatch = { localDispatch }
                           onSubmit = { () => handleExerciseSetUpdates("update") }
                        />
                     </div>
                     <div className = "mx-auto w-full">
                        <Input
                           id = "minutes"
                           type = "number"
                           label = "Minutes"
                           min = "0"
                           icon = { faStopwatch }
                           input = { localState.minutes }
                           dispatch = { localDispatch }
                           onSubmit = { () => handleExerciseSetUpdates("update") }
                        />
                     </div>
                     <div className = "mx-auto w-full">
                        <Input
                           id = "seconds"
                           type = "number"
                           label = "Seconds"
                           min = "0"
                           icon = { faStopwatch }
                           input = { localState.seconds }
                           dispatch = { localDispatch }
                           onSubmit = { () => handleExerciseSetUpdates("update") }
                           scrollIntoView
                        />
                     </div>
                  </div>
                  <TextArea
                     id = "text"
                     type = "text"
                     label = "Text"
                     icon = { faAlignJustify }
                     input = { localState.text }
                     dispatch = { localDispatch }
                  />
                  <Button
                     type = "button"
                     className = "h-[2.4rem] w-full border-[1.5px] border-gray-100 bg-green-600 px-4 py-2 font-semibold text-white focus:border-green-800 focus:ring-2 focus:ring-green-800 dark:border-0"
                     icon = { faBook }
                     onClick = { () => handleExerciseSetUpdates("update") }
                  >
                     { set !== undefined ? "Update" : "Create" }
                  </Button>
                  {
                     set !== undefined && (
                        <Confirmation
                           message = "Delete this set?"
                           onConfirmation = { () => handleExerciseSetUpdates("delete") }
                        />
                     )
                  }
               </li>
            ) : (
               set !== undefined && (
                  <li className = "mx-auto flex w-full flex-row items-start justify-start gap-2 pt-2 text-left text-sm font-semibold [overflow-wrap:anywhere] xxsm:text-[0.95rem] xsm:pl-8">
                     <div
                        className = "cursor-grab touch-none pt-1 text-sm"
                        { ...attributes }
                        { ...listeners }
                     >
                        <FontAwesomeIcon icon = { faCircleNotch } />
                     </div>
                     <div
                        className = "flex cursor-pointer flex-col gap-2 pl-2"
                        { ...doubleTap }
                     >
                        {
                           set.weight !== null && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = { faDumbbell }
                                 />
                                 <p>{ set.weight }</p>
                              </div>
                           )
                        }
                        {
                           set.repetitions !== null && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = { faArrowUp91 }
                                 />
                                 <p>{ set.repetitions }</p>
                              </div>
                           )
                        }
                        {
                           (set.hours !== null || set.minutes !== null || set.seconds !== null) && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = { faStopwatch }
                                 />
                                 <p>
                                    { String(set.hours ?? 0).padStart(2, "0") }:
                                    { String(set.minutes ?? 0).padStart(2, "0") }:
                                    { String(set.seconds ?? 0).padStart(2, "0") }
                                 </p>
                              </div>
                           )
                        }
                        {
                           set.text && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = { faAlignJustify }
                                 />
                                 <p>{ set.text }</p>
                              </div>
                           )
                        }
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
   const { id, editing } = localState.name.data;
   const [editName, setEditName] = useState<boolean>(false);
   const [addSet, setAddSet] = useState<boolean>(false);

   const collapsedId: string = `collapsed-${exercise.id}`;
   const [isCollapsed, setIsCollapsed] = useState(() => {
      return !!window.localStorage.getItem(collapsedId);
   });
   const editingExerciseId: string = localState.exerciseId.value;
   const editingExerciseSetId: string = localState.exerciseId.data.setId;
   const displayEditName = editName && editing && id === exercise.id;
   const hideNewSetButton = addSet && editingExerciseSetId === "" && editingExerciseId === exercise.id;

   useEffect(() => {
      // Save the collapsed state of a given exercise to localStorage
      if (isCollapsed) {
         window.localStorage.setItem(collapsedId, "true");
      } else {
         window.localStorage.removeItem(collapsedId);
      }
   }, [
      isCollapsed,
      collapsedId
   ]);

   // Prevent drag and drop mechanisms when editing exercise
   const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: exercise.id, disabled: displayEditName || addSet });

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
      }),
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
            // Reorder exercise sets
            const newExerciseSets: ExerciseSet[] = arrayMove(
               exercise.sets,
               oldIndex,
               newIndex,
            ).map((set, index) => {
               return {
                  ...set,
                  set_order: index
               };
            });

            const newExercise: Exercise = {
               ...exercise,
               sets: newExerciseSets
            };

            const response: VitalityResponse<Exercise> = await updateExercise(
               newExercise,
               "sets",
            );

            handleResponse(response, localDispatch, updateNotification, () => {
               // Submit changes to global state from response data
               const newExercises: Exercise[] = [...workout.exercises].map((e) =>
                  e.id !== exercise.id ? e : response.body.data as Exercise,
               );

               saveExercises(newExercises);
            });
         }
      }
   };

   const handleExerciseNameUpdates = useCallback(async() => {
      // Construct new exercise for update method
      const newName: string = localState.name.value.trim();
      const newExercise: Exercise = { ...exercise, name: newName };

      handleResponse(await updateExercise(newExercise, "name"), localDispatch, updateNotification, () => {
         // Update the overall workout exercises
         const newExercises: Exercise[] = [...workout.exercises].map((e) =>
            e.id !== exercise.id ? e : newExercise,
         );

         setEditName(false);
         saveExercises(newExercises);

         updateNotification({
            status: "Success",
            message: "Updated exercise name",
            timer: 1000
         });
      });
   }, [
      exercise,
      localDispatch,
      localState.name.value,
      saveExercises,
      updateNotification,
      workout.exercises
   ]);

   const handleExerciseDeletion = useCallback(async() => {
      const newExercises: Exercise[] = [...workout.exercises].filter(
         (e) => e.id !== exercise.id,
      );
      const response: VitalityResponse<Exercise[]> = await updateExercises(
         {
            ...workout,
            exercises: newExercises
         }
      );

      handleResponse(response, localDispatch, updateNotification, () => {
         // Update the overall workout exercises with new exercises from backend response
         saveExercises(response.body.data as Exercise[]);

         if (window.localStorage.getItem(collapsedId)) {
            // Remove from localStorage as the exercise no longer exists
            window.localStorage.removeItem(collapsedId);
         }

         updateNotification({
            status: "Success",
            message: "Deleted exercise",
            timer: 1000
         });
      });
   }, [
      workout,
      exercise.id,
      localDispatch,
      saveExercises,
      updateNotification,
      collapsedId
   ]);

   const handleExerciseNameEdits = useCallback(() => {
      // Update exercise name inputs
      localDispatch({
         type: "updateState",
         value: {
            id: "name",
            input: {
               ...localState.name,
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
      localDispatch,
      localState.name
   ]);

   const handleReset = useCallback(
      (setId: string) => {
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
      },
      [
         exercise.id,
         localDispatch,
         localState.exerciseId,
         localState.hours,
         localState.minutes,
         localState.repetitions,
         localState.seconds,
         localState.text,
         localState.weight
      ],
   );

   const doubleTap = useDoubleTap(handleExerciseNameEdits);

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
                                 input: {
                                    ...localState.name,
                                    value: "",
                                    error: null
                                 },
                                 id: "name"
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
                           setEditName(false);
                        }
                     }
                  />
                  <Input
                     id = "name"
                     type = "text"
                     label = "Name"
                     className = "mb-2"
                     icon = { faPen }
                     input = { localState.name }
                     dispatch = { localDispatch }
                     onBlur = { () => setEditName(false) }
                     onSubmit = { () => handleExerciseNameUpdates() }
                     autoComplete = "none"
                     autoFocus
                     scrollIntoView
                     required
                  />
                  <Button
                     type = "button"
                     className = "my-2 h-[2.4rem] w-full border-[1.5px] border-gray-100 bg-green-600 px-4 py-2 text-base font-bold text-white focus:border-green-800 focus:ring-2 focus:ring-green-800 dark:border-0"
                     icon = { faPen }
                     onClick = { handleExerciseNameUpdates }
                  >
                     Update
                  </Button>
                  <Confirmation
                     message = "Delete this exercise?"
                     onConfirmation = { () => handleExerciseDeletion() }
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
                                 "hidden" : exercise.sets.length === 0 && !addSet
                              })
                           }
                        >
                           {
                              exercise.sets.map((set: ExerciseSet) => {
                                 return (
                                    <SetContainer
                                       { ...props }
                                       set = { set }
                                       reset = { () => handleReset(set.id) }
                                       onBlur = { () => { } }
                                       key = { set.id }
                                    />
                                 );
                              })
                           }
                           {
                              addSet && (
                                 <SetContainer
                                    { ...props }
                                    set = { undefined }
                                    reset = { () => handleReset("") }
                                    onBlur = { () => setAddSet(false) }
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
                              className = "h-[2.4rem] w-full border-[1.5px] border-gray-100 px-4 py-2 font-bold focus:border-blue-500 focus:ring-blue-500 dark:border-0 dark:bg-gray-700/50"
                              icon = { faBook }
                              onClick = {
                                 () => {
                                    handleReset("");
                                    setAddSet(true);
                                 }
                              }
                           >
                              Set
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
   const { id, editing } = localState.name.data;

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
   const displayNewExerciseInput: boolean = addExercise && !editing;
   const exercises: Exercise[] = workout.exercises;

   const handleInitializeNewExerciseInput = useCallback(() => {
      // Update exercise name inputs
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
                  editing: false
               }
            }
         }
      });

      setAddExercise(true);
   }, [
      localDispatch,
      localState.name
   ]);

   const handleSaveExercises = useCallback(
      async(updatingExercises: Exercise[]) => {
         // Update editing workout and overall workouts for global state
         const newWorkout: Workout = { ...workout, exercises: updatingExercises };
         const newWorkouts: Workout[] = [...globalState.workouts.value].map((w) =>
            w.id !== newWorkout.id ? w : newWorkout,
         );
         const newFiltered: Workout[] = [
            ...globalState.workouts.data.filtered
         ].map((w) => (w.id !== newWorkout.id ? w : newWorkout));

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

         // Remove adding new exercise input, if applicable
         if (addExercise) {
            setAddExercise(false);
         }
      },
      [
         addExercise,
         globalDispatch,
         globalState.workout,
         globalState.workouts,
         workout
      ],
   );

   const handleDragEnd = async(event) => {
      const { active, over } = event;

      if (editing === true && id === active.id) {
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
            const newExercises = arrayMove(exercises, oldIndex, newIndex).map(
               (exercise, index) => ({
                  ...exercise,
                  exercise_order: index
               }),
            );

            const response: VitalityResponse<Exercise[]> = await updateExercises(
               {
                  ...workout,
                  exercises: newExercises
               }
            );

            handleResponse(response, localDispatch, updateNotification, () => {
               handleSaveExercises(newExercises);
            });
         }
      }
   };

   return (
      <div className = "mx-auto flex w-full flex-col items-center justify-center text-center font-bold">
         <hr className = "my-1 w-full text-black" />
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
               displayNewExerciseInput ? (
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
                        className = "h-[2.4rem] w-full border-[1.5px] border-gray-100 px-4 py-2 font-bold focus:border-blue-500 focus:ring-blue-500 dark:border-0 dark:bg-gray-700/50"
                        icon = { faDumbbell }
                        onClick = { handleInitializeNewExerciseInput }
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