import Button from "@/components/global/button";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import ImageSelection from "@/components/home/workouts/image-selection";
import Exercises from "@/components/home/workouts/exercises";
import { Modal } from "@/components/global/modal";
import { TagSelection } from "@/components/home/workouts/tag-selection";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { formReducer, handleResponse, VitalityProps, VitalityResponse, VitalityState } from "@/lib/global/state";
import { addWorkout, updateWorkout, Workout } from "@/lib/workouts/workouts";
import { Tag } from "@/lib/workouts/tags";
import { faArrowRotateLeft, faPersonRunning, faSquarePlus, faCloudArrowUp, faTrash, faTrashCan, faSignature, faCalendar, faBook, faLink, faArrowRotateBack, faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { filterWorkout } from "@/components/home/workouts/filter";

const form: VitalityState = {
   // Basic inputs not covered by other global components
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
         handlesChanges: true,
         valid: false
      }
   }
};


function updateWorkouts(currentWorkouts: Workout[], returnedWorkout: Workout, method: "add" | "update" | "delete"): Workout[] {
   let newWorkouts: Workout[] = [];

   switch (method) {
      case "delete":
         newWorkouts = [...currentWorkouts].filter(workout => workout.id !== returnedWorkout.id);
         break;
      case "update":
         newWorkouts = [...currentWorkouts].map(workout => (workout.id === returnedWorkout.id ? returnedWorkout : workout));
         break;
      default:
         newWorkouts = [...currentWorkouts, returnedWorkout];
         break;
   }

   return newWorkouts.sort((a, b) => b.date.getTime() - a.date.getTime());
};

function updateFilteredWorkouts(globalState: VitalityState, currentFiltered: Workout[],
   returnedWorkout: Workout, method: "add" | "update" | "delete", selectedTags: Set<string>): Workout[] {
   const newFiltered = [...currentFiltered].filter(workout => workout.id !== returnedWorkout.id);

   if (method !== "delete" && filterWorkout(globalState, returnedWorkout, selectedTags, "update")) {
      // Updating or new workout passes current filters
      newFiltered.push(returnedWorkout);
   }

   return newFiltered.sort((a, b) => b.date.getTime() - a.date.getTime());
};


export default function WorkoutForm(props: VitalityProps): JSX.Element {
   const { globalState, globalDispatch } = props;
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);

   // Basic workout inputs like title, date, description, and image URL stored locally
   const [localState, localDispatch] = useReducer(formReducer, form);
   const [displayPopUp, setDisplayPopUp] = useState(false);

   // Fetch current editing workout
   const workout: Workout = globalState.workout.value;

   // Empty ID implies new workout
   const isNewWorkout: boolean = workout.id?.trim().length === 0;

   // Modal relating to workout deletion confirmation message
   const deleteModalRef = useRef<{ close: () => void }>(null);

   // Workout modal container
   const formModalRef = useRef<{ open: () => void }>(null);

   const defaultDate: string = useMemo(() => {
      return new Date().toISOString().split("T")[0];
   }, []);

   const displayWorkoutForm: boolean = globalState.workout.data.display;

   const handleUpdateWorkout = async(method: "add" | "update" | "delete") => {
      const { selected, dictionary } = globalState.tags.data;

      const payload: Workout = {
         user_id: user.id,
         id: workout.id,
         title: localState.title.value.trim(),
         date: new Date(localState.date.value),
         image: localState.image.value,
         description: localState.description.value.trim(),
         tagIds: selected.map((tag: Tag) => tag?.id).filter((id: string) => dictionary[id] !== undefined),
         exercises: workout.exercises ?? []
      };

      // Request to either add or update the workout instance
      const response: VitalityResponse<Workout> = isNewWorkout
         ? await addWorkout(payload)
         : await updateWorkout(payload);

      const successMethod = () => {
         const returnedWorkout: Workout = response.body.data;

         // Fetch cached selected filtered tags
         const selectedTags: Set<string> = new Set(
            globalState.tags.data.filteredSelected.map((tag: Tag) => tag.id)
         );

         const newWorkouts: Workout[] = updateWorkouts(globalState.workouts.value, returnedWorkout, method);
         const newFiltered: Workout[] = updateFilteredWorkouts(globalState, globalState.workouts.data.filtered, returnedWorkout, method, selectedTags);

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
               }
            }
         });

         // Display update notification to the user
         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1250
         });
      };

      handleResponse(localDispatch, response, successMethod, updateNotification);
   };

   const handleInitializeWorkoutState = useCallback(() => {
      // Update input states based on current workout or new workout
      globalDispatch({
         type: "initializeState",
         value: {
            tags: {
               ...globalState.tags,
               data: {
                  ...globalState.tags.data,
                  // Display all existing tags by their id
                  selected: workout.tagIds.map((tagId: string) => globalState.tags.data.dictionary[tagId]) ?? []
               }
            },
            tagSearch: {
               ...globalState.tagSearch,
               value: ""
            }
         }
      });

      localDispatch({
         type: "initializeState",
         value: {
            title: {
               ...localState.title,
               value: workout.title,
               error: null
            },
            date: {
               ...localState.date,
               // Convert to form MM-DD-YYYY for input value
               value: isNewWorkout ? defaultDate : workout.date.toISOString().split("T")[0]
            },
            image: {
               ...localState.image,
               value: workout.image,
               error: null,
               data: {
                  valid: true,
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
   }, [defaultDate, globalDispatch, globalState.tagSearch, globalState.tags, isNewWorkout, localState.date, localState.description,
      localState.image, localState.title, workout.date, workout.description, workout.image, workout.tagIds, workout.title]);

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
   }, [globalDispatch, localDispatch, globalState.tags]);

   useEffect(() => {
      if (displayWorkoutForm && !(displayPopUp)) {
         setDisplayPopUp(true);
         handleInitializeWorkoutState();
         formModalRef.current?.open();
      }
   }, [displayWorkoutForm, displayPopUp, handleInitializeWorkoutState]);


   return (
      <Modal
         display={null}
         className = "max-w-3xl"
         ref = {formModalRef}
         onClose = {() => {
            // Cleanup workout form component for future usage
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

            setDisplayPopUp(false);
         }}
         onClick = {handleInitializeWorkoutState}
      >
         <div className = "relative">
            <div className = "flex flex-col justify-center align-center text-center gap-2">
               <FontAwesomeIcon
                  icon = {faPersonRunning}
                  className = "text-6xl text-primary mt-1"
               />
               <h1 className = "text-3xl font-bold text-black mb-2">
                  {isNewWorkout ? "New" : "Edit"} Workout
               </h1>
            </div>
            <div className = "relative mt-8 w-full flex flex-col justify-center align-center text-left gap-2">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {handleReset}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <Input
                  id = "title"
                  type = "text"
                  label = "Title"
                  icon = {faSignature}
                  input = {localState.title}
                  dispatch = {localDispatch}
                  autoFocus
                  required />
               <Input
                  id = "date"
                  type = "date"
                  label = "Title"
                  icon = {faCalendar}
                  input = {localState.date}
                  dispatch = {localDispatch}
                  required />
               <TagSelection {...props} />
               <TextArea
                  id = "description"
                  type = "text"
                  label = "Description"
                  icon = {faBook}
                  input = {localState.description}
                  dispatch = {localDispatch} />
               <ImageSelection
                  id = "image"
                  type = "text"
                  label = "URL"
                  icon = {faLink}
                  input = {localState.image}
                  dispatch = {localDispatch} />
               {
                  !(isNewWorkout) && (
                     <Modal
                        className = "max-w-xl"
                        ref = {deleteModalRef}
                        display = {
                           <Button
                              type = "button"
                              className = "w-full bg-red-500 text-white h-[2.6rem]"
                              icon = {faTrash}
                           >
                              Delete
                           </Button>
                        }
                     >
                        <div className = "flex flex-col justify-between items-center gap-4 p-2">
                           <FontAwesomeIcon
                              icon = {faTrashCan}
                              className = "text-red-500 text-3xl" />
                           <p className = "font-bold">
                              Delete this workout?
                           </p>
                           <div className = "flex flex-row flex-wrap justify-center items-center gap-2">
                              <Button
                                 type = "button"
                                 icon = {faArrowRotateBack}
                                 className = "w-[10rem] bg-gray-100 text-black px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-blue-500 focus:ring-blue-500 hover:scale-105 transition duration-300 ease-in-out"
                                 onClick = {() => {
                                    // Close the modal for deletion confirmation
                                    if (deleteModalRef.current) {
                                       deleteModalRef.current.close();
                                    }
                                 }}
                              >
                                 No, cancel
                              </Button>
                              <Button
                                 type = "button"
                                 icon = {faSquareCheck}
                                 className = "w-[10rem] bg-red-500 text-white px-4 py-2 font-bold border-gray-100 border-[1.5px] h-[2.5rem] focus:border-red-300 focus:ring-red-300 hover:scale-105 transition duration-300 ease-in-out"
                                 onClick = {async() => handleUpdateWorkout("delete")}
                              >
                                 Yes, I&apos;m sure
                              </Button>
                           </div>
                        </div>
                     </Modal>
                  )
               }
               <Button
                  type = "button"
                  className = "bg-primary text-white h-[2.6rem]"
                  icon = {props !== undefined ? faCloudArrowUp : faSquarePlus}
                  onClick = {() => handleUpdateWorkout(isNewWorkout ? "add" : "update")}
               >
                  {
                     isNewWorkout ? "Create" : "Update"
                  }
               </Button>
               {
                  !(isNewWorkout) && (
                     <Exercises
                        workout = {workout}
                        globalState = {globalState}
                        globalDispatch = {globalDispatch} />
                  )
               }
            </div>
         </div>
      </Modal>
   );
};