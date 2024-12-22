import Modal from "@/components/global/modal";
import Button from "@/components/global/button";
import Tags from "@/components/home/workouts/tags";
import TextArea from "@/components/global/textarea";
import Images from "@/components/home/workouts/images";
import Exercises from "@/components/home/workouts/exercises";
import Confirmation from "@/components/global/confirmation";
import { Input } from "@/components/global/input";
import { Tag } from "@/lib/home/workouts/tags";
import { verifyImageURL } from "@/lib/home/workouts/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { filterWorkout } from "@/components/home/workouts/filtering";
import { handleResponse, VitalityResponse } from "@/lib/global/response";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { VitalityProps, VitalityState, formReducer } from "@/lib/global/state";
import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { addWorkout, deleteWorkouts, updateWorkout, Workout } from "@/lib/home/workouts/workouts";
import { faArrowRotateLeft, faPersonRunning, faSignature, faCalendar, faBook, faLink, faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons";

const form: VitalityState = {
   title: {
      value: "",
      error: null,
      data: {}
   },
   date: {
      value: "",
      error: null,
      data: {}
   },
   description: {
      value: "",
      error: null,
      data: {}
   },
   image: {
      value: "",
      error: null,
      data: {
         valid: undefined
      },
      handlesOnChange: true
   }
};

export default function Form(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const [localState, localDispatch] = useReducer(formReducer, form);
   const [displayingFormModal, setDisplayingFormModal] = useState<boolean>(false);
   const displayFormModal: boolean = globalState.workout.data.display;
   const formModalRef = useRef<{ open: () => void; close: () => void }>(null);
   const saveButtonRef = useRef<{ displaySave: () => void; }>(null);

   // Fetching editing workout from global state
   const workout: Workout = globalState.workout.value;
   const isNewWorkout: boolean = workout.id?.trim().length === 0;

   const defaultFormDate: string = useMemo(() => {
      return new Date().toISOString().split("T")[0];
   }, []);

   const updateWorkouts = (workouts: Workout[], newWorkout: Workout, method: "add" | "update" | "delete") => {
      if (method === "delete") {
         // Simple removal
         return [...workouts].filter(
            (workout) => workout.id !== newWorkout.id,
         );
      } else if (method === "update" && workout.date.getTime() === newWorkout.date.getTime()) {
         // Simple update in current editing workout without affecting overall workout ordering
         return [...workouts].map(
            (workout) => workout.id === newWorkout.id ? newWorkout : workout
         );
      } else {
         // Update or addition requiring changes in workouts ordering
         const newWorkouts: Workout[] = method === "add" ? [...workouts] : [...workouts].filter(
            (workout) => workout.id !== newWorkout.id
         );

         for (let i = 0; i < newWorkouts.length; i++) {
            const workout: Workout = newWorkouts[i];

            if (workout.date.getTime() <= newWorkout.date.getTime()) {
               newWorkouts.splice(i, 0, newWorkout);
               return newWorkouts;
            }
         }

         newWorkouts.push(newWorkout);
         return newWorkouts;
      }
   };

   const handleUpdateWorkout = async(method: "add" | "update" | "delete") => {
      const { selected, dictionary } = globalState.tags.data;

      const payload: Workout = {
         user_id: user.id,
         id: workout.id,
         title: localState.title.value.trim(),
         date: new Date(localState.date.value),
         image: localState.image.value,
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

      const response: VitalityResponse<Workout | number> = isNewWorkout ? await addWorkout(user.id, payload) :
         method === "update" ? await updateWorkout(user.id, payload) : await deleteWorkouts(user.id, [payload]);

      handleResponse(response, localDispatch, updateNotification, () => {
         const newWorkout: Workout | null = method === "delete" ? payload : (response.body.data as Workout);

         // Fetch selected filtered tags to apply tag filtering
         const filteredTagIds: Set<string> = new Set(
            globalState.tags.data.filtered.map(
               (tag: Tag) => tag.id
            )
         );

         const newWorkouts: Workout[] = updateWorkouts(globalState.workouts.value, newWorkout, method);

         const newFiltered: Workout[] = [...newWorkouts].filter(
            (workout) => filterWorkout(globalState, workout, filteredTagIds, "update")
         );

         // Account for current visible workouts page being discarded
         const pages: number = Math.ceil(newWorkouts.length / globalState.paging.value);
         const page: number = globalState.page.value;

         // Update editing workout and overall workouts global state
         globalDispatch({
            type: "updateStates",
            value: {
               workout: {
                  ...globalState.workout,
                  value: newWorkout,
                  data: {
                     ...globalState.workout.data,
                     display: method === "delete" ? false : true
                  }
               },
               workouts: {
                  ...globalState.workouts,
                  value: newWorkouts,
                  data: {
                     ...globalState.workouts.data,
                     filtered: newFiltered
                  }
               },
               page: {
                  ...globalState.page,
                  value: page >= pages ? Math.max(0, page - 1) : page
               }
            }
         });

         if (method === "delete") {
            formModalRef.current?.close();

            updateNotification({
               status: "Success",
               message: "Deleted workout",
               timer: 1000
            });
         } else {
            method !== "add" && saveButtonRef.current?.displaySave();
         }
      });
   };

   const handleDisplayWorkoutForm = useCallback(() => {
      // Update workout tag selection form inputs
      globalDispatch({
         type: "initializeState",
         value: {
            tags: {
               ...globalState.tags,
               data: {
                  ...globalState.tags.data,
                  selected:
                     workout.tagIds.map(
                        (tagId: string) => globalState.tags.data.dictionary[tagId],
                     ) ?? []
               }
            },
            tagSearch: {
               ...globalState.tagSearch,
               error: null,
               value: ""
            }
         }
      });

      // Update workout property inputs
      localDispatch({
         type: "initializeState",
         value: {
            title: {
               ...localState.title,
               error: null,
               value: workout.title
            },
            date: {
               ...localState.date,
               error: null,
               value: isNewWorkout ? defaultFormDate : workout.date.toISOString().split("T")[0]
            },
            image: {
               ...localState.image,
               value: workout.image,
               error: null,
               data: {
                  ...localState.image.data,
                  valid: verifyImageURL(workout.image) ? true : workout.image !== "" ? false : undefined,
                  error: false
               }
            },
            description: {
               ...localState.description,
               error: null,
               value: workout.description
            }
         }
      });
   }, [
      defaultFormDate,
      globalDispatch,
      globalState.tagSearch,
      globalState.tags,
      isNewWorkout,
      localState.date,
      localState.description,
      localState.image,
      localState.title,
      workout.date,
      workout.description,
      workout.image,
      workout.tagIds,
      workout.title
   ]);

   const handleCloseWorkoutForm = useCallback(() => {
      // Cleanup form inputs for future submissions
      globalDispatch({
         type: "updateState",
         value: {
            id: "workout",
            input: {
               ...globalState.workout,
               value: {
                  id: "",
                  user_id: user.id,
                  title: "",
                  date: "",
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
   }, [globalDispatch,
      globalState.workout,
      user
   ]);

   const handleResetWorkoutForm = useCallback(() => {
      // Reset tag selection and workout property inputs
      globalDispatch({
         type: "updateState",
         value: {
            id: "tags",
            input: {
               ...globalState.tags,
               data: {
                  ...globalState.tags.data,
                  selected: []
               }
            }
         }
      });

      localDispatch({
         type: "resetState",
         value: {}
      });
   }, [
      globalDispatch,
      localDispatch,
      globalState.tags
   ]);

   useEffect(() => {
      if (displayFormModal && !displayingFormModal) {
         setDisplayingFormModal(true);
         handleDisplayWorkoutForm();
         formModalRef.current?.open();
      }
   }, [
      displayFormModal,
      displayingFormModal,
      handleDisplayWorkoutForm
   ]);

   return (
      <div className = "mx-auto mb-4 flex w-full justify-center">
         <Modal
            display = { null }
            className = "max-w-3xl"
            ref = { formModalRef }
            onClose = { handleCloseWorkoutForm }
            onClick = { handleDisplayWorkoutForm }
         >
            <div className = "relative">
               <div className = "flex flex-col items-center justify-center gap-2 text-center">
                  <FontAwesomeIcon
                     icon = { faPersonRunning }
                     className = "mt-6 text-[3.5rem] text-primary sm:text-6xl"
                  />
                  <h1 className = "mb-2 text-2xl font-bold sm:text-3xl">
                     { isNewWorkout ? "New" : "Edit" } Workout
                  </h1>
               </div>
               <div className = "relative mt-8 flex w-full flex-col items-stretch justify-center gap-2 text-left">
                  <FontAwesomeIcon
                     icon = { faArrowRotateLeft }
                     onClick = { handleResetWorkoutForm }
                     className = "absolute right-[10px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-primary"
                  />
                  <Input
                     id = "title"
                     type = "text"
                     label = "Title"
                     icon = { faSignature }
                     input = { localState.title }
                     dispatch = { localDispatch }
                     onSubmit = { () => handleUpdateWorkout(isNewWorkout ? "add" : "update") }
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
                     onSubmit = { () => handleUpdateWorkout(isNewWorkout ? "add" : "update") }
                     required
                  />
                  <Tags
                     { ...props }
                  />
                  <Images
                     id = "image"
                     type = "text"
                     label = "URL"
                     icon = { faLink }
                     input = { localState.image }
                     dispatch = { localDispatch }
                  />
                  <TextArea
                     id = "description"
                     type = "text"
                     label = "Description"
                     icon = { faBook }
                     input = { localState.description }
                     onSubmit = { () => handleUpdateWorkout(isNewWorkout ? "add" : "update") }
                     dispatch = { localDispatch }
                  />
                  <Button
                     ref = { saveButtonRef }
                     icon = { faPenToSquare }
                     type = "button"
                     className = "h-10 bg-primary text-white"
                     onClick = { () => handleUpdateWorkout(isNewWorkout ? "add" : "update") }
                  >
                     { isNewWorkout ? "Create" : "Update" }
                  </Button>
                  {
                     !isNewWorkout && (
                        <Confirmation
                           message = "Delete this workout?"
                           onConfirmation = { () => handleUpdateWorkout("delete") }
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
                        input: {
                           ...globalState.workout,
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