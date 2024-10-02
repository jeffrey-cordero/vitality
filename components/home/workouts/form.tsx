import Button from "@/components/global/button";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import ImageSelection from "@/components/home/workouts/image-selection";
import { TagSelection } from "@/components/home/workouts/tag-selection";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { VitalityAction, VitalityResponse, VitalityState } from "@/lib/global/state";
import { addWorkout, updateWorkout, Workout } from "@/lib/workouts/workouts";
import { Tag } from "@/lib/workouts/tags";
import { faArrowRotateLeft, faPersonRunning, faSquarePlus, faCloudArrowUp, faTrash, faPencil, faPlus, faTrashCan, faSignature, faCalendar, faBook, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, useContext, useRef, useState } from "react";
import { PopUp } from "@/components/global/popup";
import { filterWorkout } from "@/components/home/workouts/filter";

interface WorkoutFormProps {
   cover?: React.ReactNode;
   workout: Workout | undefined;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout | null>>;
   reset: () => void;
}

export default function WorkoutForm(props: WorkoutFormProps): JSX.Element {
   const { workout, cover, state, dispatch, reset } = props;
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const [workoutId, setWorkoutId] = useState<string | undefined>(workout?.id);
   const deletePopUpRef = useRef<{ close: () => void }>(null);

   const handleWorkoutSubmission = async(event: React.MouseEvent<HTMLButtonElement>, method: "update" | "delete") => {
      event.stopPropagation();

      if (user !== undefined) {
         const { selected, dictionary } = state.inputs.tags.data;

         const payload: Workout = {
            user_id: user.id,
            id: workoutId !== undefined ? workoutId : "",
            title: state.inputs.title.value.trim(),
            date: new Date(state.inputs.date.value),
            image: state.inputs.image.value,
            description: state.inputs.description.value.trim(),
            // Ensure only valid tag id's are sent to the backend, which may be removed from other workout forms
            tagIds: selected.map((selected: Tag) => selected?.id).filter((id: string) => dictionary[id] !== undefined)
         };

         // We request to either add or update the workout instance
         const response: VitalityResponse<Workout> = workoutId === undefined
            ? await addWorkout(payload) : await updateWorkout(payload);

         // Add new workout in response body to state and display notification message
         if (response.status === "Success") {
            let newWorkouts: Workout[] = [];
            let newFiltered: Workout[] = [];

            const returnedWorkout: Workout = response.body.data;

            if (workoutId === undefined && method === "update") {
               // New workout added
               newWorkouts = [...state.inputs.workouts.value, returnedWorkout];

               // Edit the workout after construction
               setWorkoutId(returnedWorkout.id);

               if (filterWorkout(state, returnedWorkout))  {
                  // New workout passes current filter(s)
                  newFiltered = [...state.inputs.workouts.data.filtered, returnedWorkout];
               } else {
                  newFiltered = [...state.inputs.workouts.data.filtered];
               }
            } else if (method === "delete") {
               // Remove the existing workout
               newWorkouts = [...state.inputs.workouts.value].filter((workout: Workout) => workout.id !== returnedWorkout.id);

               // Remove from visible filtered list, if applicable
               newFiltered = [...state.inputs.workouts.data.filtered].filter((workout: Workout) => workout.id !== returnedWorkout.id);
            } else {
               // Update the existing workout
               newWorkouts = [...state.inputs.workouts.value].map((workout: Workout) => {
                  return workout.id === returnedWorkout.id ? returnedWorkout : workout;
               });

               for (const filtered of state.inputs.workouts.data.filtered) {
                  if (filtered.id !== returnedWorkout.id) {
                     // Other filtered workout
                     newFiltered.push(filtered);
                  } else if (filterWorkout(state, returnedWorkout)) {
                     // Updated workout passes filter, thus pass store the new reference
                     newFiltered.push(returnedWorkout);
                  }
               }
            }

            // Sort the workout lists from latest to farthest dates (if date changed)
            if (workout.date.getTime() !== returnedWorkout.date.getTime()) {
               newWorkouts = newWorkouts.sort((a, b) => b.date.getTime() - a.date.getTime());
               newFiltered = newFiltered.sort((a, b) => b.date.getTime() - a.date.getTime());
            }

            dispatch({
               type: "updateState",
               value: {
                  ...state,
                  inputs: {
                     ...state.inputs,
                     workouts: {
                        ...state.inputs.workouts,
                        data: {
                           ...state.inputs.workouts.data,
                           filtered: newFiltered
                        },
                        value: newWorkouts
                     }
                  }
               }
            });
         }

         if (response.status !== "Error") {
            // Display the success or failure notification to the user
            updateNotification({
               status: response.status,
               message: response.body.message,
               timer: 1250
            });
         } else {
            // Display errors
            dispatch({
               type: "updateStatus",
               value: response
            });
         }
      }
   };

   return (
      <PopUp
         text = {workoutId !== undefined ? "Edit Workout" : "New Workout"}
         className = "max-w-3xl"
         buttonClassName = "w-[9.5rem] h-[2.9rem] text-white text-md font-semibold bg-primary hover:scale-[1.05] transition duration-300 ease-in-out"
         icon = {faPlus}
         onClick = {() => {
            // Update input states based on current workout or to a new workout
            dispatch({
               type: "initializeState",
               value: {
                  title: {
                     ...state.inputs.title,
                     value: workout?.title ?? ""
                  },
                  date: {
                     ...state.inputs.date,
                     // Convert to form MM-DD-YYYY for input value
                     value: workout?.date.toISOString().split("T")[0] ?? ""
                  },
                  image: {
                     ...state.inputs.image,
                     value: workout?.image ?? ""
                  },
                  description: {
                     ...state.inputs.description,
                     value: workout?.description ?? ""
                  },
                  tags: {
                     ...state.inputs.tags,
                     data: {
                        ...state.inputs.tags.data,
                        // Display all selected tags by their id's, if applicable
                        selected: workout?.tagIds.map((tagId: string) => state.inputs.tags.data.dictionary[tagId]) ?? []
                     }
                  },
                  tagsSearch: {
                     ...state.inputs.tagsSearch,
                     value: ""
                  }
               }
            });
         }}
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
                  {workoutId !== undefined ? "Edit" : "New"} Workout
               </h1>
            </div>
            <div className = "relative mt-2 w-full flex flex-col justify-center align-center text-left gap-3">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {() => reset()}
                  className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
               />
               <Input input = {state.inputs.title} label = "Title" icon = {faSignature} dispatch = {dispatch} />
               <Input input = {state.inputs.date} label = "Date" icon = {faCalendar} dispatch = {dispatch} />
               <TagSelection input = {state.inputs.tags} label = "Tags " dispatch = {dispatch} state = {state} />
               <TextArea input = {state.inputs.description} label = "Description" icon = {faBook} dispatch = {dispatch} />
               <ImageSelection input = {state.inputs.image} label = "URL" icon = {faLink} dispatch = {dispatch} />
               {
                  workout !== undefined && workoutId !== undefined && (
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
                              Are you sure you want to delete this workout?
                           </p>
                           <div className = "flex flex-row justify-center items-center gap-4 flex-1">
                              <Button
                                 type = "button"
                                 className = "w-[10rem] bg-gray-100 text-black mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] min-h-[2.7rem] focus:border-blue-500 focus:ring-blue-500 hover:scale-105 transition duration-300 ease-in-out"
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
                                 className = "w-[10rem] bg-red-500 text-white mt-2 px-4 py-2 font-semibold border-gray-100 border-[1.5px] min-h-[2.7rem] focus:border-red-300 focus:ring-red-300 hover:scale-105 transition duration-300 ease-in-out"
                                 onClick = {async(event) => handleWorkoutSubmission(event, "delete")}
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
                  onClick = {(event) => handleWorkoutSubmission(event, "update")}
               >
                  {
                     workoutId !== undefined ? "Save" : "Create"
                  }
               </Button>
               {
                  workoutId !== undefined && (
                     <div>
                        EDIT HERE!
                     </div>
                  )
               }
            </div>
         </div>
      </PopUp>
   );
}