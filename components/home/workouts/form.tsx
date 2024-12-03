import Button from "@/components/global/button";
import TextArea from "@/components/global/textarea";
import Images from "@/components/home/workouts/images";
import Exercises from "@/components/home/workouts/exercises";
import Conformation from "@/components/global/confirmation";
import Modal from "@/components/global/modal";
import Tags from "@/components/home/workouts/tags";
import { Input } from "@/components/global/input";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { VitalityProps, VitalityState, formReducer } from "@/lib/global/state";
import { handleResponse, VitalityResponse } from "@/lib/global/response";
import { addWorkout, deleteWorkouts, updateWorkout, Workout } from "@/lib/home/workouts/workouts";
import { Tag } from "@/lib/home/workouts/tags";
import { faArrowRotateLeft, faPersonRunning, faSquarePlus, faCloudArrowUp, faSignature, faCalendar, faBook, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { filterWorkout } from "@/components/home/workouts/filtering";
import { verifyImageURL } from "@/lib/home/workouts/shared";

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
   const [displayingFormModal, setDisplayingFormModal] = useState(false);
   const displayFormModal: boolean = globalState.workout.data.display;
   const formModalRef = useRef<{ open: () => void; close: () => void }>(null);

   // Current editing workout
   const workout: Workout = globalState.workout.value;

   // Empty workout ID implies new workout construction
   const isNewWorkout: boolean = workout.id?.trim().length === 0;

   const defaultDate: string = useMemo(() => {
      return new Date().toISOString().split("T")[0];
   }, []);

   const updateWorkouts = (
      currentWorkouts: Workout[],
      returnedWorkout: Workout,
      method: "add" | "update" | "delete",
   ) => {
      let requiresSorting: boolean = method === "add";
      let newWorkouts: Workout[] = [];

      switch (method) {
         case "update":
            newWorkouts = [...currentWorkouts].map((workout) => {
               if (workout.id === returnedWorkout.id) {
                  requiresSorting = workout.date.getTime() !== returnedWorkout.date.getTime();
                  return returnedWorkout;
               }

               return workout;
            });
            break;
         case "delete":
            newWorkouts = [...currentWorkouts].filter(
               (workout) => workout.id !== returnedWorkout.id,
            );
            break;
         default:
            newWorkouts = [...currentWorkouts, returnedWorkout];
            break;
      }

      if (requiresSorting) {
         return newWorkouts.sort((a, b) => b.date.getTime() - a.date.getTime());
      } else {
         return newWorkouts;
      }
   };

   const updateFilteredWorkouts = (
      globalState: VitalityState,
      currentFiltered: Workout[],
      returnedWorkout: Workout,
      method: "add" | "update" | "delete",
      selectedTags: Set<string>,
   ) => {
      let requiresSorting: boolean = method === "add";

      const newFiltered: Workout[] = [...currentFiltered].map((workout) => {
         if (workout.id === returnedWorkout.id) {
            requiresSorting = workout.date.getTime() !== returnedWorkout.date.getTime();
            return returnedWorkout;
         }

         return workout;
      });

      if (method === "add") {
         newFiltered.push(returnedWorkout);
      }

      if (method === "delete" || !filterWorkout(globalState, returnedWorkout, selectedTags, "update")) {
         return newFiltered.filter((workout) => workout.id !== returnedWorkout.id);
      } else if (requiresSorting) {
         return newFiltered.sort((a, b) => b.date.getTime() - a.date.getTime());
      } else {
         return newFiltered;
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
            .map((tag: Tag) => tag?.id)
            .filter((id: string) => dictionary[id] !== undefined),
         exercises: workout.exercises ?? []
      };

      const response: VitalityResponse<Workout | number> = isNewWorkout
         ? await addWorkout(payload) : method === "update"
            ? await updateWorkout(payload)
            : await deleteWorkouts([payload], user.id);

      handleResponse(response, localDispatch, updateNotification, () => {
         const returnedWorkout: Workout | null =
            method === "delete" ? payload : (response.body.data as Workout);

         // Fetch selected filtered tags to apply tag filtering
         const filteredTags: Set<string> = new Set(
            globalState.tags.data.filtered.map((tag: Tag) => tag.id),
         );

         const newWorkouts: Workout[] = updateWorkouts(
            globalState.workouts.value,
            returnedWorkout,
            method,
         );

         const newFiltered: Workout[] = updateFilteredWorkouts(
            globalState,
            globalState.workouts.data.filtered,
            returnedWorkout,
            method,
            filteredTags,
         );

         // Account for current page in workouts view being removed
         const pages: number = Math.ceil(
            newWorkouts.length / globalState.paging.value,
         );

         const page: number = globalState.page.value;

         // Update editing workout and overall workouts global state
         globalDispatch({
            type: "updateStates",
            value: {
               workout: {
                  ...globalState.workout,
                  value: returnedWorkout
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

         // Close the form modal after a successful deletion
         if (method === "delete") {
            updateNotification({
               status: "Success",
               message: "Deleted workout",
               timer: 1000
            });

            formModalRef.current?.close();
         } else {
            updateNotification({
               status: "Success",
               message: isNewWorkout ? "Added Workout" : "Updated Workout",
               timer: 1000
            });
         }
      });
   };

   const handleInitializeWorkoutState = useCallback(() => {
      // Update input states based on existing or new workout
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
               value: isNewWorkout
                  ? defaultDate
                  : workout.date.toISOString().split("T")[0]
            },
            image: {
               ...localState.image,
               value: workout.image,
               error: null,
               data: {
                  ...localState.image.data,
                  valid: verifyImageURL(workout.image)
                     ? true
                     : workout.image !== ""
                        ? false
                        : undefined,
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
      defaultDate,
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

   const handleFormModalClose = useCallback(() => {
      // Cleanup workout form inputs for future new workout submissions
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

   const handleReset = useCallback(() => {
      // Reset basic form inputs
      localDispatch({
         type: "resetState",
         value: {}
      });

      // Reset current selected tags
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
   }, [
      globalDispatch,
      localDispatch,
      globalState.tags
   ]);

   useEffect(() => {
      if (displayFormModal && !displayingFormModal) {
         setDisplayingFormModal(true);
         handleInitializeWorkoutState();
         formModalRef.current?.open();
      }
   }, [
      displayFormModal,
      displayingFormModal,
      handleInitializeWorkoutState
   ]);

   return (
      <div className = "mx-auto my-4 flex w-full justify-center">
         <Modal
            display = { null }
            className = "max-w-3xl"
            ref = { formModalRef }
            onClose = { handleFormModalClose }
            onClick = { handleInitializeWorkoutState }
         >
            <div className = "relative">
               <div className = "flex flex-col items-center justify-center gap-2 text-center">
                  <FontAwesomeIcon
                     icon = { faPersonRunning }
                     className = "mt-6 text-5xl text-primary sm:text-6xl"
                  />
                  <h1 className = "mb-2 text-2xl font-bold sm:text-3xl">
                     { isNewWorkout ? "New" : "Edit" } Workout
                  </h1>
               </div>
               <div className = "relative mt-8 flex w-full flex-col items-stretch justify-center gap-2 text-left">
                  <FontAwesomeIcon
                     icon = { faArrowRotateLeft }
                     onClick = { handleReset }
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
                     label = "Title"
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
                     type = "button"
                     className = "h-[2.4rem] bg-primary text-white"
                     icon = { props !== undefined ? faCloudArrowUp : faSquarePlus }
                     onClick = {
                        () =>
                           handleUpdateWorkout(isNewWorkout ? "add" : "update")
                     }
                  >
                     { isNewWorkout ? "Create" : "Update" }
                  </Button>
                  {
                     !isNewWorkout && (
                        <Conformation
                           message = "Delete this workout?"
                           onConformation = { () => handleUpdateWorkout("delete") }
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
            className = "h-[2.8rem] w-40 bg-primary p-3 text-base text-white"
            icon = { faPersonRunning }
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