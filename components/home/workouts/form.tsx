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
import { Dispatch, useCallback, useContext, useMemo, useRef, useState } from "react";
import { PopUp } from "@/components/global/popup";
import { filterWorkout } from "@/components/home/workouts/filter";

interface WorkoutFormProps {
   cover?: React.ReactNode;
   workout: Workout | undefined;
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout | null>>;
   reset: (_filterReset: boolean) => void;
}

function updateWorkouts(currentWorkouts: Workout[], returnedWorkout: Workout, method: "add" | "update" | "delete" ) {
   let newWorkouts: Workout[] = [];

   switch (method) {
   case "delete":
      newWorkouts = currentWorkouts.filter(workout => workout.id !== returnedWorkout.id);
      break;
   case "update":
      newWorkouts = currentWorkouts.map(workout => (workout.id === returnedWorkout.id ? returnedWorkout : workout));
      break;
   default:
      newWorkouts = [...currentWorkouts, returnedWorkout];
      break;
   }

   return newWorkouts.sort((a, b) => b.date.getTime() - a.date.getTime());
};

function updateFilteredWorkouts(state: VitalityState, currentFiltered: Workout[],
   returnedWorkout: Workout, method: "add" | "update" | "delete") {
   let newFiltered = [...currentFiltered];

   if (method === "delete") {
      newFiltered = newFiltered.filter(workout => workout.id !== returnedWorkout.id);
   } else {
      newFiltered = newFiltered.filter(workout => workout.id !== returnedWorkout.id);

      if (filterWorkout(state, returnedWorkout)) {
         // New workout passes current filters
         newFiltered.push(returnedWorkout);
      }
   }

   return newFiltered.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export default function WorkoutForm(props: WorkoutFormProps): JSX.Element {
   const { workout, cover, state, dispatch, reset } = props;
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const [workoutId, setWorkoutId] = useState<string | undefined>(workout?.id);
   const deletePopUpRef = useRef<{ close: () => void }>(null);

   const defaultDate: string = useMemo(() => {
      return new Date().toISOString().split("T")[0];
   }, []);

   const handleWorkoutSubmission = useCallback(async(method: "add" | "update" | "delete") => {
      const { selected, dictionary } = state.inputs.tags.data;

      const payload: Workout = {
         user_id: user.id,
         id: workoutId ?? "",
         title: state.inputs.title.value.trim(),
         date: new Date(state.inputs.date.value),
         image: state.inputs.image.value,
         description: state.inputs.description.value.trim(),
         // Ensure only existing tag id's are sent to the backend (in case of removal)
         tagIds: selected.map((tag: Tag) => tag?.id).filter((id: string) => dictionary[id] !== undefined)
      };

      // Request to either add or update the workout instance
      const response: VitalityResponse<Workout> = workoutId === undefined
         ? await addWorkout(payload)
         : await updateWorkout(payload);

      // Handle successful response
      if (response.status === "Success") {
         const returnedWorkout: Workout = response.body.data;

         const newWorkouts: Workout[] = updateWorkouts(state.inputs.workouts.value, returnedWorkout, method);
         const newFiltered: Workout[] = updateFilteredWorkouts(state, state.inputs.workouts.data.filtered, returnedWorkout, method);

         // Dispatch the new state with updated workouts
         dispatch({
            type: "updateInput",
            value: {
               ...state.inputs.workouts,
               data: {
                  ...state.inputs.workouts.data,
                  filtered: newFiltered
               },
               value: newWorkouts
            }
         });

         // Display success or failure notification to the user
         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1250
         });

         if (method === "add") {
            // Allow workout to be edited
            setWorkoutId(returnedWorkout.id);
         }
      } else {
         // Display errors
         dispatch({
            type: "updateStatus",
            value: response
         });
      }
   }, [dispatch, state, updateNotification, user?.id, workoutId]);

   const handleInitializeWorkoutState = useCallback(() => {
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
               value: workout?.date.toISOString().split("T")[0] ?? defaultDate
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
                  // Display all existing tags by their id
                  selected: workout?.tagIds.map((tagId: string) => state.inputs.tags.data.dictionary[tagId]) ?? []
               }
            },
            tagsSearch: {
               ...state.inputs.tagsSearch,
               value: ""
            }
         }
      });
   }, [defaultDate, dispatch, state.inputs.date, state.inputs.description, state.inputs.image, state.inputs.tags, state.inputs.tagsSearch, state.inputs.title, workout?.date, workout?.description, workout?.image, workout?.tagIds, workout?.title]);

   return (
      <PopUp
         text = {workoutId !== undefined ? "Edit Workout" : "New Workout"}
         className = "max-w-3xl"
         buttonClassName = "w-[9.5rem] h-[2.9rem] text-white text-md font-semibold bg-primary hover:scale-[1.05] transition duration-300 ease-in-out"
         icon = {faPlus}
         onClose = {() => {
            if (workout === undefined) {
               // Cleanup new workout form component for future "New Workout" usage
               setWorkoutId(undefined);
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
                  {workoutId !== undefined ? "Edit" : "New"} Workout
               </h1>
            </div>
            <div className = "relative mt-2 w-full flex flex-col justify-center align-center text-left gap-3">
               <FontAwesomeIcon
                  icon = {faArrowRotateLeft}
                  onClick = {() => reset(false)}
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
                                 onClick = {async() => handleWorkoutSubmission("delete")}
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
                  onClick = {() => handleWorkoutSubmission(workoutId === undefined ? "add" : "update")}
               >
                  {
                     workoutId !== undefined ? "Save" : "Create"
                  }
               </Button>
               {
                  workoutId !== undefined && (
                     <div className = "w-full mx-auto text-center my-4 font-bold">
                        Exercise Inputs Coming Soon...
                     </div>
                  )
               }
            </div>
         </div>
      </PopUp>
   );
}