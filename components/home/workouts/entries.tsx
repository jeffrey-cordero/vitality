import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { faAlignJustify, faArrowRotateLeft, faArrowUp91, faCircleNotch, faDumbbell, faPersonRunning, faStopwatch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useCallback, useContext, useRef, useState } from "react";
import { useDoubleTap } from "use-double-tap";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Confirmation from "@/components/global/confirmation";
import { Input } from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import { ExerciseProps } from "@/components/home/workouts/exercises";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { Exercise, ExerciseEntry, isEmptyExerciseEntry, updateExercise } from "@/lib/home/workouts/exercises";

interface ExerciseEntryContainerProps extends ExerciseProps {
   entry: ExerciseEntry | undefined;
   reset: () => void;
}

function parseExerciseEntryNumber(value: any): number | null {
   const isEmpty: boolean = typeof value === "string" && value.trim().length === 0;
   const number: number = +value;

   return (isEmpty || isNaN(number) || number < 0) ? null : number;
};

export default function ExerciseEntryContainer(props: ExerciseEntryContainerProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { workout, exercise, entry, localState, localDispatch, onBlur, reset, saveExercises } = props;
   const [isEditing, setIsEditing] = useState<boolean>(entry === undefined);
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   // Interning exercise entry form inputs
   const isNewEntry: boolean = entry === undefined;
   const editingExerciseId: string = localState.exerciseId.value;
   const editingEntryId: string = localState.exerciseId.data?.entryId;
   const displayEditEntryInputs = isEditing && exercise.id === editingExerciseId && (isNewEntry ? editingEntryId === "" : entry.id === editingEntryId);

   // Prevent drag and drop mechanisms when creating or editing an exercise entry or when there is only one entry
   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: entry?.id,
      disabled: isNewEntry || displayEditEntryInputs || exercise.entries.length === 1
   });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition
   };

   const updateExerciseEntry = async(method: "add" | "update" | "delete") => {
      const newEntry: ExerciseEntry = {
         id: isNewEntry ? "" : entry.id,
         exercise_id: exercise.id,
         entry_order: isNewEntry ? exercise.entries.length : entry.entry_order,
         weight: parseExerciseEntryNumber(localState.weight.value),
         repetitions: parseExerciseEntryNumber(localState.repetitions.value),
         hours: parseExerciseEntryNumber(localState.hours.value),
         minutes: parseExerciseEntryNumber(localState.minutes.value),
         seconds: parseExerciseEntryNumber(localState.seconds.value),
         text: localState.text.value.trim()
      };

      let response: VitalityResponse<Exercise>;

      if (await isEmptyExerciseEntry(newEntry)) {
         // Prevent empty exercise entry submissions
         return;
      }

      if (method === "add") {
         // Add new entry to array of exercise entries
         const newEntries: ExerciseEntry[] = [...exercise.entries, newEntry];
         const newExercise: Exercise = {
            ...exercise,
            entries: newEntries
         };

         response = await updateExercise(user.id, newExercise, "entries");
      } else {
         // Update or delete entry from array of exercise entries
         const newEntries: ExerciseEntry[] = method === "update" ?
            [...exercise.entries].map((entry) => (entry.id === newEntry.id ? newEntry : entry))
            : [...exercise.entries].filter((entry) => entry.id !== newEntry.id);

         const newExercise: Exercise = {
            ...exercise,
            entries: newEntries
         };

         response = await updateExercise(user.id, newExercise, "entries");
      }

      processResponse(response, localDispatch, updateNotifications, () => {
         // Update editing exercise
         const newExercises: Exercise[] = [...workout.exercises].map((e) =>
            e.id === exercise.id ? response.body.data as Exercise : e,
         );

         saveExercises(newExercises);
         onBlur !== undefined ? onBlur() : setIsEditing(false);
      });
   };

   const submitExerciseEntryUpdates = useCallback(() => {
      updateButtonRef.current?.submit();
   }, []);

   const editExerciseEntry = useCallback(() => {
      // Update inputs to match exercise entry values
      localDispatch({
         type: "updateStates",
         value: {
            exerciseId: {
               value: exercise.id,
               data: {
                  entryId: entry?.id ?? ""
               }
            },
            weight: {
               value: entry?.weight ?? "",
               error: null
            },
            repetitions: {
               value: entry?.repetitions ?? "",
               error: null
            },
            hours: {
               value: entry?.hours ?? "",
               error: null
            },
            minutes: {
               value: entry?.minutes ?? "",
               error: null
            },
            seconds: {
               value: entry?.seconds ?? "",
               error: null
            },
            text: {
               value: entry?.text ?? "",
               error: null
            }
         }
      });

      // Display inputs
      setIsEditing(true);
   }, [
      entry,
      exercise.id,
      localDispatch
   ]);

   const doubleTap = useDoubleTap(editExerciseEntry);

   return (
      <div
         ref = { setNodeRef }
         style = { style }
         className = "mx-auto w-full"
      >
         {
            displayEditEntryInputs ? (
               <li className = "relative mx-auto mt-10 flex w-full flex-col items-stretch justify-start gap-2 px-2 text-center font-medium sm:px-8">
                  <FontAwesomeIcon
                     icon = { faArrowRotateLeft }
                     onClick = { reset }
                     className = "absolute right-[35px] top-[-25px] z-10 cursor-pointer pr-2 text-base text-primary sm:pr-8"
                  />
                  <FontAwesomeIcon
                     icon = { faXmark }
                     className = "absolute right-[10px] top-[-27px] z-10 cursor-pointer pr-2 text-xl text-red-500 sm:pr-8"
                     onClick = {
                        () => {
                           if (isNewEntry) {
                              // Remove from DOM for new exercise entry inputs
                              onBlur();
                           }

                           setIsEditing(false);
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
                     onSubmit = { submitExerciseEntryUpdates }
                     autoFocus
                  />
                  <Input
                     id = "repetitions"
                     type = "number"
                     label = "Repetitions"
                     min = "0"
                     icon = { faArrowUp91 }
                     input = { localState.repetitions }
                     dispatch = { localDispatch }
                     onSubmit = { submitExerciseEntryUpdates }
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
                           onSubmit = { submitExerciseEntryUpdates }
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
                           onSubmit = { submitExerciseEntryUpdates }
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
                           onSubmit = { submitExerciseEntryUpdates }
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
                     ref = { updateButtonRef }
                     type = "button"
                     className = "h-10 w-full border-[1.5px] border-gray-100 bg-green-500 px-4 py-2 font-semibold text-white focus:border-green-700 focus:ring-2 focus:ring-green-700 dark:border-0"
                     icon = { faPersonRunning }
                     onSubmit = { async() => await updateExerciseEntry(isNewEntry ? "add" : "update") }
                     onClick = { submitExerciseEntryUpdates }
                     isSingleSubmission = { isNewEntry ? true : undefined }
                     inputIds = { ["weight", "repetitions", "hours", "minutes", "seconds", "text"] }
                  >
                     { isNewEntry ? "Create" : "Update" }
                  </Button>
                  {
                     !isNewEntry && (
                        <Confirmation
                           message = "Delete entry?"
                           onConfirmation = { () => updateExerciseEntry("delete") }
                        />
                     )
                  }
               </li>
            ) : (
               !isNewEntry && (
                  <li className = "mx-auto flex w-full flex-row items-start justify-start gap-2 pt-2 text-left text-[0.95rem] font-semibold xxsm:text-base">
                     <div
                        className = {
                           clsx("cursor-default touch-none pt-1 text-sm", {
                              "cursor-grab": exercise.entries.length > 1
                           })
                        }
                        { ...attributes }
                        { ...listeners }
                     >
                        <FontAwesomeIcon icon = { faCircleNotch } />
                     </div>
                     <div
                        className = "flex cursor-pointer flex-col gap-2 overflow-x-auto pl-2"
                        { ...doubleTap }
                     >
                        {
                           entry.weight !== null && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = { faDumbbell }
                                 />
                                 <p>{ entry.weight }</p>
                              </div>
                           )
                        }
                        {
                           entry.repetitions !== null && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = { faArrowUp91 }
                                 />
                                 <p>{ entry.repetitions }</p>
                              </div>
                           )
                        }
                        {
                           (entry.hours !== null || entry.minutes !== null || entry.seconds !== null) && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = { faStopwatch }
                                 />
                                 <p>
                                    { String(entry.hours ?? 0).padStart(2, "0") }:
                                    { String(entry.minutes ?? 0).padStart(2, "0") }:
                                    { String(entry.seconds ?? 0).padStart(2, "0") }
                                 </p>
                              </div>
                           )
                        }
                        {
                           entry.text && (
                              <div className = "flex flex-row items-center justify-start gap-2 font-semibold">
                                 <FontAwesomeIcon
                                    className = "self-start pt-1 text-primary"
                                    icon = { faAlignJustify }
                                 />
                                 <p>{ entry.text }</p>
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