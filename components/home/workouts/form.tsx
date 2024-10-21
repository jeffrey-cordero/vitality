import Button from "@/components/global/button";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import ImageSelection from "@/components/home/workouts/image-selection";
import Exercises from "@/components/home/workouts/exercises";
import { TagSelection } from "@/components/home/workouts/tag-selection";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { formReducer, useHandleResponse, VitalityAction, VitalityProps, VitalityResponse, VitalityState } from "@/lib/global/state";
import { addWorkout, updateWorkout, Workout } from "@/lib/workouts/workouts";
import { Tag } from "@/lib/workouts/tags";
import { faArrowRotateLeft, faPersonRunning, faSquarePlus, faCloudArrowUp, faTrash, faPencil, faPlus, faTrashCan, faSignature, faCalendar, faBook, faLink, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, useCallback, useContext, useMemo, useReducer, useRef, useState } from "react";
import { filterWorkout } from "@/components/home/workouts/filter";
import { PopUp } from "@/components/global/popup";

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
         handlesChanges: true
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
   returnedWorkout: Workout, method: "add" | "update" | "delete"): Workout[] {
   const newFiltered = [...currentFiltered].filter(workout => workout.id !== returnedWorkout.id);

   if (method !== "delete" && filterWorkout(globalState, returnedWorkout)) {
      // Updating or new workout passes current filters
      newFiltered.push(returnedWorkout);

   }

   return newFiltered.sort((a, b) => b.date.getTime() - a.date.getTime());
};

interface WorkoutFormProps extends VitalityProps {
   cover: React.ReactNode | null;
   reset: (_filterReset: boolean) => void;
}

export default function WorkoutForm(props: WorkoutFormProps): JSX.Element {
   const { cover, globalState, globalDispatch, reset } = props;
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);

   // Basic workout inputs like title, date, description, and image URL stored locally
   const [localState, localDispatch] = useReducer(formReducer, form);

   // Fetch current editing workout store in state
   const workout: Workout = globalState.workout.value;
   const isNewWorkout: boolean = workout.id.trim().length === 0;

   // Pop-up relating to workout deletion confirmation message
   const deletePopUpRef = useRef<{ close: () => void }>(null);

   const defaultDate: string = useMemo(() => {
      return new Date().toISOString().split("T")[0];
   }, []);

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

         const newWorkouts: Workout[] = updateWorkouts(globalState.workouts.value, returnedWorkout, method);
         const newFiltered: Workout[] = updateFilteredWorkouts(globalState, globalState.workouts.data.filtered, returnedWorkout, method);

         // New overall workouts state updates
         globalDispatch({
            type: "updateState",
            value: {
               id: "workouts",
               input: {
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

      useHandleResponse(globalDispatch, response, successMethod, updateNotification);
   };

   const handleInitializeWorkoutState = () => {
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
            tagsSearch: {
               ...globalState.tagsSearch,
               value: ""
            }
         }
      });

      localDispatch({
         type: "initializeState",
         value: {
            title: {
               ...localState.title,
               value: workout.title ?? ""
            },
            date: {
               ...localState.date,
               // Convert to form MM-DD-YYYY for input value
               value: isNewWorkout ? defaultDate: workout.date.toISOString().split("T")[0]
            },
            image: {
               ...localState.image,
               value: workout.image ?? ""
            },
            description: {
               ...localState.description,
               value: workout.description ?? ""
            }
         }
      });
   };


   return (
      <PopUp
         text = {isNewWorkout ? "Edit Workout" : "New Workout"}
         className = "max-w-3xl"
         buttonClassName = "w-[9.5rem] h-[2.9rem] text-white text-md font-semibold bg-primary hover:scale-[1.05] transition duration-300 ease-in-out"
         icon = {faPlus}
         onClose = {() => {
            if (isNewWorkout) {
               // Cleanup new workout form component for future "New Workout" usage by resetting global editing workout
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
                        }
                     }
                  }
               });
            }
         }}
         onClick = {handleInitializeWorkoutState}
         cover = {
            cover ?? <FontAwesomeIcon icon = {faPencil} className = "text-primary cursor-pointer text-lg hover:scale-125 transition duration-300 ease-in-out" />
         }
      >
         <div className = "relative">
            <div className = "flex flex-col justify-center align-center text-center gap-3">
               <FontAwesomeIcon
                  icon = {faPersonRunning}
                  className = "text-6xl text-primary mt-1"
               />
               <h1 className = "text-3xl font-bold text-black mb-2">
                  {isNewWorkout !== undefined ? "Edit" : "New"} Workout
               </h1>
            </div>
            <div className = "relative mt-2 w-full flex flex-col justify-center align-center text-left gap-3">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {() => reset(false)}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <Input id = "title" type = "text" label = "Title" icon = {faSignature} input = {localState.title} dispatch = {localDispatch} autoFocus required />
               <Input id = "date" type = "date" label = "Title" icon = {faCalendar} input = {localState.date} dispatch = {localDispatch} required />

               {/* <TagSelection id = "title" type = "text" label = "Title" icon = {faSignature} input = {localState.title} globalState = {globalState} dispatch = {localDispatch} /> */}
               <TextArea id = "description" type = "text" label = "Description" icon = {faBook} input = {localState.description} dispatch = {localDispatch} />
               {/* <ImageSelection id = "image" type = "text" label = "URL" icon = {faLink} input = {localState.image} dispatch = {localDispatch} /> */}
               {
                  !(isNewWorkout) && (
                     <PopUp
                        className = "max-w-xl"
                        ref = {deletePopUpRef}
                        cover = {
                           <Button
                              type = "button"
                              className = "w-full bg-red-500 text-white h-[2.6rem]"
                              icon = {faTrash}
                           >
                              Delete
                           </Button>
                        }
                     >
                        <div className = "flex flex-col justify-center items-center gap-4">
                           <FontAwesomeIcon icon = {faTrashCan} className = "text-red-500 text-4xl" />
                           <p className = "font-bold">
                              Are you sure you want to delete this workout
                           </p>
                           <div className = "flex flex-row justify-center items-center gap-4 flex-1">
                              <Button
                                 type = "button"
                                 className = "w-[10rem] bg-gray-100 text-black mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-blue-500 focus:ring-blue-500 hover:scale-105 transition duration-300 ease-in-out"
                                 onClick = {() => {
                                    // Close the popup for deletion confirmation
                                    if (deletePopUpRef.current) {
                                       deletePopUpRef.current.close();
                                    }
                                 }}
                              >
                                 No, cancel
                              </Button>
                              <Button
                                 type = "button"
                                 className = "w-[10rem] bg-red-500 text-white mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] h-[2.9rem] focus:border-red-300 focus:ring-red-300 hover:scale-105 transition duration-300 ease-in-out"
                                 onClick = {async() => handleUpdateWorkout("delete")}
                              >
                                 Yes, I&apos;m sure
                              </Button>
                           </div>
                        </div>
                     </PopUp>
                  )
               }
               <Button
                  type = "button"
                  className = "bg-primary text-white h-[2.6rem]"
                  icon = {props !== undefined ? faCloudArrowUp : faSquarePlus}
                  onClick = {() => handleUpdateWorkout(isNewWorkout ? "add" : "update")}
               >
                  {
                     isNewWorkout !== undefined ? "Save" : "Create"
                  }
               </Button>
               {/* {
                  isNewWorkout !== undefined && (
                     <Exercises workout = {workout} globalState = {globalState} globalDispatch = {globalDispatch} />
                  )
               } */}
            </div>
         </div>
      </PopUp>
   );
};