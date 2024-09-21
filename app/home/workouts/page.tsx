"use client";
import WorkoutForm from "@/components/home/workouts/form";
import WorkoutTable from "@/components/home/workouts/table";
import { AuthenticationContext } from "@/app/layout";
import { fetchWorkoutsInformation, fetchWorkoutTags, Workout } from "@/lib/workouts/workouts";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { formReducer, VitalityState } from "@/lib/global/state";
import WorkoutCards from "@/components/home/workouts/cards";
import Button from "@/components/global/button";
import clsx from "clsx";

const workouts: VitalityState = {
   status: "Initial",
   inputs: {
      title: {
         type: "text",
         id: "title",
         value: "",
         error: null,
         data: {}
      },
      date: {
         type: "date",
         id: "date",
         value: "",
         error: null,
         data: {}
      },
      description: {
         type: "text",
         id: "description",
         value: "",
         error: null,
         data: {}
      },
      image: {
         type: "text",
         id: "image",
         value: "",
         error: null,
         data: {
            handlesChanges: true
         }
      },
      search: {
         type: "text",
         id: "search",
         value: "",
         error: null,
         data: {}
      },
      tags: {
         type: null,
         id: "tags",
         value: null,
         error: null,
         data: {
            // [tag.id] -> tag
            dictionary: {},
            options: [],
            selected: [],
            inputs: {
               editTitle: {
                  type: "text",
                  id: "editTitle",
                  value: "",
                  error: null,
                  data: {
                     handlesChanges: true
                  }
               },
               editColor: {
                  type: "text",
                  id: "colors",
                  value: null,
                  error: null,
                  data: {
                     handlesChanges: true
                  }
               }
            },
            handlesChanges: true
         }
      },
      workouts: {
         type: null,
         id: "workouts",
         value: [],
         error: null,
         data: {
            fetched: false,
            selected: new Set<Workout>()
         }
      }
   },
   response: null
};

export default function Page() {
   const { user } = useContext(AuthenticationContext);
   const [state, dispatch] = useReducer(formReducer, workouts);
   const [view, setView] = useState<"table" | "cards">("table");

   const fetchWorkouts = useCallback(async() => {
      if (user !== undefined && state.inputs.workouts.data.fetched === false) {
         try {
            const [workoutsData, tagsData] = await Promise.all([
               fetchWorkoutsInformation(user.id),
               fetchWorkoutTags(user.id)
            ]);

            dispatch({
               type: "initializeState",
               value: {
                  tags: {
                     ...state.inputs.tags,
                     data: {
                        ...state.inputs.tags.data,
                        options: tagsData,
                        selected: [],
                        dictionary: Object.fromEntries(tagsData.map(tag => [tag.id, tag]))
                     }
                  },
                  workouts: {
                     ...state.inputs.workouts,
                     value: workoutsData,
                     data: {
                        ...state.inputs.workouts.data,
                        fetched: true
                     }
                  }
               }
            });
         } catch (error) {
            console.error("Failed to fetch workouts or tags:", error);
         }
      }
   }, [user, state.inputs.tags, state.inputs.workouts, dispatch]);

   const handleReset = useMemo(() => {
      return () => {
         dispatch({
            // Reset state for new workout form
            type: "resetState",
            value: {
               // Reset selected tags data
               tags: {
                  data: {
                     ...state.inputs.tags.data,
                     selected: []
                  },
                  value: state.inputs.tags.value
               },
               workouts: {
                  data: {
                     ...state.inputs.workouts.data
                  },
                  value: state.inputs.workouts.value
               }
            }
         });
      };
   }, [state.inputs.tags.data, state.inputs.tags.value,
      state.inputs.workouts.data, state.inputs.workouts.value]);


   useEffect(() => {
      if (!(state.inputs.workouts.data.fetched)) {
         fetchWorkouts();
      }
   }, [fetchWorkouts, state.inputs.workouts.data.fetched, state.inputs.tags, state.inputs.workouts]);

   return (
      <main className = "w-full mx-auto flex gap-2 min-h-screen flex-col items-center justify-start text-center">
         <div>
            <h1 className = "text-4xl font-bold mt-8">Welcome Back, Champion!</h1>
            <p className = "text-lg text-gray-700 mt-4">Ready to crush your goals? Create a new workout and let&apos;s make today count!</p>
         </div>
         <div className = "flex justify-center w-full mx-auto">
            <WorkoutForm
               workout = {undefined}
               state = {state}
               dispatch = {dispatch}
               reset = {handleReset}
            />
         </div>
         <div className = "relative w-10/12 overflow-x-auto flex justify-start items-center text-left gap-2">
            <Button 
               onClick={()=> setView("table")}
               className={clsx("transition duration-300 ease-in-out", {
                  "scale-105 border-b-4 border-b-primary rounded-none": view === "table"
               })}>
               Table
            </Button>
            <Button 
               onClick={()=> setView("cards")}
               className={clsx("transition duration-300 ease-in-out", {
                  "scale-105  border-b-4 border-b-primary rounded-none": view === "cards"
               })}>
               Cards
            </Button>
         </div>
         {
            view === "table" ? (
               <WorkoutTable state = {state} dispatch = {dispatch} reset = {handleReset}/>
            ) : (
               <WorkoutCards state = {state} dispatch = {dispatch} reset = {handleReset} />
            )
         }
      </main >
   );
}