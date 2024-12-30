import { faArrowRotateLeft, faBook, faCalendar, faLink, faPenToSquare, faPersonRunning, faPlus, faSignature } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Confirmation from "@/components/global/confirmation";
import ImageForm from "@/components/global/images";
import { Input } from "@/components/global/input";
import Modal from "@/components/global/modal";
import TextArea from "@/components/global/textarea";
import Exercises from "@/components/home/workouts/exercises";
import { filterWorkout } from "@/components/home/workouts/filtering";
import TagsForm from "@/components/home/workouts/tags";
import { formReducer, VitalityProps, VitalityState } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { verifyImageURL } from "@/lib/home/workouts/shared";
import { Tag } from "@/lib/home/workouts/tags";
import { addWorkout, updateWorkout, Workout } from "@/lib/home/workouts/workouts";

const form: VitalityState = {
   title: {
      id: "title",
      value: "",
      error: null
   },
   date: {
      id: "date",
      value: "",
      error: null
   },
   description: {
      id: "description",
      value: "",
      error: null
   },
   image: {
      id: "image",
      value: "",
      error: null,
      handlesChanges: true,
      data: {
         valid: undefined
      }
   }
};

export default function Form(props: VitalityProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { globalState, globalDispatch } = props;
   const [localState, localDispatch] = useReducer(formReducer, form);
   const [displayingFormModal, setDisplayingFormModal] = useState<boolean>(false);
   const [modalLocked, setModalLocked] = useState<boolean>(false);
   const displayFormModal: boolean = globalState.workout.data?.display;
   const formModalRef = useRef<{ open: () => void; close: () => void; isOpen: () => boolean }>(null);
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   // Fetch current workout being edited from global state
   const workout: Workout = globalState.workout.value;
   const isNewWorkout: boolean = workout.id?.trim().length === 0;

   const updateWorkouts = (workout: Workout, workouts: Workout[], newWorkout: Workout, method: "add" | "update" | "delete") => {
      // Helper method to update workouts (overall or filtered) array based on CRUD method based on current editing workout
      if (method === "delete") {
         return [...workouts].filter(
            (workout) => workout.id !== newWorkout.id
         );
      } else if (method === "update" && workout.date.getTime() === newWorkout.date.getTime()) {
         // No changes in ordering as workout date remains the same
         return [...workouts].map(
            (workout) => workout.id === newWorkout.id ? newWorkout : workout
         );
      } else {
         // Update workouts array based on new workout date
         const newWorkouts: Workout[] = method === "add" ? [...workouts] : [...workouts].filter(
            (workout) => workout.id !== newWorkout.id
         );

         for (let i = 0; i < newWorkouts.length; i++) {
            const workout: Workout = newWorkouts[i];

            if (workout.date.getTime() <= newWorkout.date.getTime()) {
               // Insert new workout at the correct chronological order
               newWorkouts.splice(i, 0, newWorkout);
               return newWorkouts;
            }
         }

         newWorkouts.push(newWorkout);
         return newWorkouts;
      }
   };

   const updateWorkoutState = async(method: "add" | "update" | "delete") => {
      const { selected, dictionary } = globalState.tags.data;

      const payload: Workout = {
         user_id: user.id,
         id: workout.id,
         title: localState.title.value.trim(),
         date: new Date(localState.date.value),
         image: localState.image.value.trim(),
         description: localState.description.value.trim(),
         tagIds: selected
            .map(
               (tag: Tag) => tag?.id
            )
            .filter(
               (id: string) => dictionary[id] !== undefined
            ),
         exercises: workout.exercises ?? []
      };

      // Determine whether to add, update, or delete workout based on method provided
      const response: VitalityResponse<Workout> = method === "add"
         ? await addWorkout(user.id, payload) : await updateWorkout(user.id, payload, method);

      if (response.status !== "Success") {
         // Unlock modal for non-successful responses
         setModalLocked(false);
      }

      processResponse(response, localDispatch, updateNotifications, () => {
         const newWorkout: Workout | null = method === "delete" ? payload : (response.body.data as Workout);

         // Fetch selected filtered tag id's to apply potential filtering
         const filteredTagIds: Set<string> = new Set(
            globalState.tags.data?.filtered.map(
               (tag: Tag) => tag.id
            )
         );

         const newWorkouts: Workout[] = updateWorkouts(workout, globalState.workouts.value, newWorkout, method);
         const newFiltered: Workout[] = [...newWorkouts].filter(
            (workout: Workout) => filterWorkout(globalState, workout, filteredTagIds, "update")
         );
         let newSelected: Set<Workout> = globalState.workouts.data?.selected ?? new Set();

         if (globalState.workouts.data?.selected.has(workout)) {
            // Update selected workout reference, if applicable
            newSelected = new Set(
               Array.from(globalState.workouts.data?.selected).map(
                  (workout: Workout) => workout.id === newWorkout.id ? newWorkout : workout
               )
            );

            method === "delete" && newSelected.delete(newWorkout);
         }

         // Account for current visible workouts page and total pages
         const pages: number = Math.ceil(newWorkouts.length / globalState.paging.value);
         const page: number = globalState.page.value;

         globalDispatch({
            type: "updateStates",
            value: {
               workout: {
                  value: newWorkout,
                  data: {
                     display: method === "delete" ? false : true
                  }
               },
               workouts: {
                  value: newWorkouts,
                  data: {
                     filtered: newFiltered,
                     selected: newSelected
                  }
               },
               page: {
                  value: page >= pages ? Math.max(0, page - 1) : page
               }
            }
         });

         // Unlock modal after updating global state
         setModalLocked(false);

         if (method === "delete") {
            formModalRef.current?.close();

            updateNotifications({
               status: "Success",
               message: "Deleted workout",
               timer: 1000
            });
         }
      });
   };

   const submitWorkoutUpdates = useCallback(() => {
      // Lock modal to prevent state mismanagement
      setModalLocked(true);

      // Submit workout updates to the server
      updateButtonRef.current?.submit();
   }, []);

   const displayWorkoutForm = useCallback(() => {
      // Update workout tag selection form inputs
      globalDispatch({
         type: "updateStates",
         value: {
            tags: {
               data: {
                  selected: workout.tagIds.map(
                     (tagId: string) => globalState.tags.data?.dictionary[tagId]
                  )
               }
            }
         }
      });

      // Update workout property inputs
      localDispatch({
         type: "updateStates",
         value: {
            title: {
               error: null,
               value: workout.title
            },
            date: {
               error: null,
               value: isNewWorkout ?
                  new Date().toISOString().split("T")[0] : workout.date.toISOString().split("T")[0]
            },
            image: {
               value: workout.image,
               error: null,
               data: {
                  valid: verifyImageURL(workout.image) ? true : workout.image !== "" ? false : undefined,
                  error: false
               }
            },
            description: {
               error: null,
               value: workout.description
            }
         }
      });
   }, [
      isNewWorkout,
      workout.date,
      workout.title,
      workout.image,
      workout.tagIds,
      globalDispatch,
      workout.description,
      globalState.tags.data?.dictionary
   ]);

   const closeWorkoutForm = useCallback(() => {
      // Cleanup form inputs for future form submissions
      globalDispatch({
         type: "updateState",
         value: {
            id: "workout",
            value: {
               value: {
                  id: "",
                  user_id: user.id,
                  title: "",
                  date: new Date(),
                  image: "",
                  description: "",
                  tagIds: [],
                  exercises: []
               },
               data: {
                  display: false
               }
            }
         }
      });

      setDisplayingFormModal(false);
   }, [
      user,
      globalDispatch
   ]);

   const resetWorkoutForm = useCallback(() => {
      // Reset tag selection and workout property inputs
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            value: {
               data: {
                  selected: []
               }
            }
         }
      });

      localDispatch({
         type: "resetState",
         value: form
      });
   }, [
      localDispatch,
      globalDispatch
   ]);

   useEffect(() => {
      if (displayFormModal && !displayingFormModal) {
         // Open workout form modal if not already displayed
         formModalRef.current?.open();
         setDisplayingFormModal(true);
      }
   }, [
      displayFormModal,
      displayWorkoutForm,
      displayingFormModal
   ]);

   return (
      <div className = "mx-auto mb-4 flex w-full justify-center">
         <Modal
            display = { null }
            className = "max-w-3xl"
            ref = { formModalRef }
            onClose = { closeWorkoutForm }
            onClick = { displayWorkoutForm }
            locked = { modalLocked }
         >
            <div className = "relative">
               <div className = "flex flex-col items-center justify-center gap-2 text-center">
                  <FontAwesomeIcon
                     icon = { faPersonRunning }
                     className = "mt-6 text-[3.6rem] text-primary xxsm:text-[3.7rem]"
                  />
                  <h1 className = "text-[1.7rem] font-bold xxsm:text-[1.9rem]">
                     { isNewWorkout ? "New" : "Edit" } Workout
                  </h1>
               </div>
               <div className = "relative mt-8 flex w-full flex-col items-stretch justify-center gap-2 text-left">
                  <FontAwesomeIcon
                     icon = { faArrowRotateLeft }
                     onClick = { resetWorkoutForm }
                     className = "absolute right-[10px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-primary"
                  />
                  <Input
                     id = "title"
                     type = "text"
                     label = "Title"
                     icon = { faSignature }
                     input = { localState.title }
                     dispatch = { localDispatch }
                     onSubmit = { submitWorkoutUpdates }
                     autoFocus
                     required
                  />
                  <Input
                     id = "date"
                     type = "date"
                     label = "Date"
                     icon = { faCalendar }
                     input = { localState.date }
                     dispatch = { localDispatch }
                     onSubmit = { submitWorkoutUpdates }
                     required
                  />
                  <TagsForm { ...props } />
                  <ImageForm
                     id = "image"
                     type = "text"
                     label = "URL"
                     icon = { faLink }
                     input = { localState.image }
                     dispatch = { localDispatch }
                     page = "workouts"
                  />
                  <TextArea
                     id = "description"
                     type = "text"
                     label = "Description"
                     icon = { faBook }
                     input = { localState.description }
                     onSubmit = { submitWorkoutUpdates }
                     dispatch = { localDispatch }
                  />
                  <Button
                     ref = { updateButtonRef }
                     icon = { faPenToSquare }
                     type = "button"
                     className = "h-10 bg-primary text-white"
                     onSubmit = { () => updateWorkoutState(isNewWorkout ? "add" : "update") }
                     onClick = { submitWorkoutUpdates }
                     isSingleSubmission = { isNewWorkout ? true : undefined }
                     inputIds = { ["title", "date", "tagSearch", "image-form-button", "image", "description"] }
                  >
                     { isNewWorkout ? "Create" : "Update" }
                  </Button>
                  {
                     !isNewWorkout && (
                        <Confirmation
                           message = "Delete workout?"
                           onConfirmation = { async() => await updateWorkoutState("delete") }
                        />
                     )
                  }
                  {
                     !isNewWorkout && (
                        <Exercises
                           workout = { workout }
                           globalState = { globalState }
                           globalDispatch = { globalDispatch }
                        />
                     )
                  }
               </div>
            </div>
         </Modal>
         <Button
            type = "button"
            className = "h-[2.9rem] w-40 bg-primary text-base text-white"
            icon = { faPlus }
            onClick = {
               () => {
                  globalDispatch({
                     type: "updateState",
                     value: {
                        id: "workout",
                        value: {
                           value: {
                              id: "",
                              user_id: user.id,
                              title: "",
                              date: new Date(),
                              image: "",
                              description: "",
                              tagIds: [],
                              exercises: []
                           },
                           data: {
                              display: true
                           }
                        }
                     }
                  });
               }
            }
         >
            New Workout
         </Button>
      </div>
   );
}