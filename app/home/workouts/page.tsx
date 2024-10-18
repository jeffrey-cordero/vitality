"use client";
import WorkoutForm from "@/components/home/workouts/form";
import WorkoutTable from "@/components/home/workouts/table";
import WorkoutCards from "@/components/home/workouts/cards";
import Button from "@/components/global/button";
import Pagination from "@/components/home/workouts/pagination";
import clsx from "clsx";
import Input from "@/components/global/input";
import { AuthenticationContext } from "@/app/layout";
import { fetchWorkouts, Workout } from "@/lib/workouts/workouts";
import { fetchWorkoutTags } from "@/lib/workouts/tags";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { formReducer, VitalityState } from "@/lib/global/state";
import { getWorkoutDate, searchForTitle } from "@/lib/workouts/shared";
import { faPersonRunning, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FilterByDate, FilterByTags } from "@/components/home/workouts/filter";

const workouts: VitalityState = {
   // Workout form
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
   // Tag form
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
         handlesChanges: true
      }
   },
   tagsTitle: {
      type: "text",
      id: "tagsTitle",
      value: "",
      error: null,
      data: {}
   },
   tagsColor: {
      type: "text",
      id: "tagsColor",
      value: null,
      error: null,
      data: {
         handlesChanges: true
      }
   },
   tagsSearch: {
      type: "text",
      id: "tagsSearch",
      value: "",
      error: null,
      data: {}
   },
   // Main overall workout objects
   workouts: {
      type: null,
      id: "workouts",
      value: [],
      error: null,
      data: {
         fetched: false,
         selected: new Set<Workout>(),
         dateFiltered: false,
         tagsFiltered: false,
         // Based on search title pattern, data interval, tags, etc.
         filtered: []
      }
   },
   // Filter form
   workoutsSearch: {
      type: "text",
      id: "workoutsSearch",
      value: "",
      error: null,
      data: {}
   },
   workoutsDateFilter: {
      type: "select",
      value: "Is on or after",
      id: "workoutsDateFilter",
      error: null,
      data: {
         options: ["Is on or after", "Is on or before", "Is between"]
      }
   },
   workoutsMinDate: {
      type: "date",
      id: "workoutsMinDate",
      value: getWorkoutDate(new Date()),
      error: null,
      data: {}
   },
   workoutsMaxDate: {
      type: "date",
      id: "workoutsMaxDate",
      value: getWorkoutDate(new Date()),
      error: null,
      data: {}
   },
   workoutsPaging: {
      type: "select",
      id: "workoutsPaging",
      value: 10,
      error: null,
      data: {
         page: 0,
         options: [5, 10, 25, 50, 100, 500, 1000],
         handlesChanges: true
      }
   },
   // Exercise form
   exerciseTitle: {
      type: "text",
      id: "exerciseTitle",
      value: "",
      error: null,
      data: {
         id: "",
         edit: false
      }
   },
   weight: {
      type: "number",
      id: "weight",
      value: "",
      error: null,
      data: {}
   },
   repetitions: {
      type: "number",
      id: "repetitions",
      value: "",
      error: null,
      data: {}
   },
   hours: {
      type: "number",
      id: "hours",
      value: "",
      error: null,
      data: {}
   },
   minutes: {
      type: "number",
      id: "minutes",
      value: "",
      error: null,
      data: {}
   },
   seconds: {
      type: "number",
      id: "seconds",
      value: "",
      error: null,
      data: {}
   },
   text: {
      type: "text",
      id: "text",
      value: "",
      error: null,
      data: {}
   },
   // Store editing exercise ID to control interning inputs
   exerciseId: {
      type: null,
      id: "exerciseId",
      value : null,
      error: null,
      data: {
         // Editing set ID to display potential inputs for
         setId: ""
      }
   }
};

export default function Page(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const [state, dispatch] = useReducer(formReducer, workouts);
   const [view, setView] = useState<"table" | "cards">("table");

   // Convert search string to lower case for case-insensitive comparison
   const search: string = useMemo(() => {
      return state.workoutsSearch.value.trim().toLowerCase();
   }, [state.workoutsSearch]);

   // Filtered based on selected tags or date intervals
   const filtered: Workout[] = state.workouts.data.filtered;

   // Search results for workouts, accounting for pagination
   const results: Workout[] = useMemo(() => {
      return searchForTitle(filtered, search);
   }, [filtered, search]);

   const pages: number = state.workoutsPaging.value;
   const page: number = state.workoutsPaging.data.page;

   const low: number = page * pages;
   const high = low + pages - 1;

   const workoutsSection: Workout[] = useMemo(() => {
      return results.slice(low, high + 1);
   }, [results, low, high]);

   const fetchWorkoutsData = useCallback(async() => {
      if (user !== undefined && state.workouts.data.fetched === false) {
         try {
            const [workoutsData, tagsData] = await Promise.all([
               fetchWorkouts(user.id),
               fetchWorkoutTags(user.id)
            ]);

            dispatch({
               type: "initializeState",
               value: {
                  tags: {
                     ...state.tags,
                     data: {
                        ...state.tags.data,
                        options: tagsData,
                        selected: [],
                        filteredSelected: [],
                        dictionary: Object.fromEntries(tagsData.map(tag => [tag.id, tag]))
                     }
                  },
                  workouts: {
                     ...state.workouts,
                     value: workoutsData,
                     data: {
                        ...state.workouts.data,
                        filtered: workoutsData,
                        dateFiltered: false,
                        tagsFiltered: false,
                        fetched: true
                     }
                  }
               }
            });
         } catch (error) {
            console.error(error);
         }
      }
   }, [user, state.tags, state.workouts, dispatch]);


   const handleReset = (filterReset: boolean) => {
      dispatch({
         // Reset state for new workout form
         type: "resetState",
         value: {
            // Reset selected tags data
            tags: {
               data: {
                  ...state.tags.data,
                  selected: [],
                  filteredSelected: []
               },
               value: state.tags.value
            },
            workouts: {
               data: {
                  ...state.workouts.data,
                  // Hitting reset icon for filter forms should reset filtering options
                  tagsFiltered: filterReset ? false : state.workouts.data.tagsFiltered,
                  dateFiltered: filterReset ? false : state.workouts.data.dateFiltered,
                  filtered: filterReset ? state.workouts.value : state.workouts.data.filtered,
                  selected: filterReset ? new Set<Workout>() :  state.workouts.data.selected
               },
               value: state.workouts.value
            },
            workoutsDateFilter: {
               data: {
                  ...state.workoutsDateFilter.data
               },
               value: state.workoutsDateFilter.value
            },
            workoutsPaging: {
               data: {
                  ...state.workoutsPaging.data,
                  page: 0
               },
               value: state.workoutsPaging.value
            }
         }
      });
   };

   useEffect(() => {
      if (!(state.workouts.data.fetched)) {
         fetchWorkoutsData();
      }
   }, [fetchWorkoutsData, state.workouts.data.fetched, state.tags, state.workouts]);

   return (
      <main className = "w-full mx-auto my-6 flex min-h-screen flex-col items-center justify-start gap-4 text-center">
         <div>
            <h1 className = "text-4xl font-bold mt-8">Welcome Back, Champion!</h1>
            <p className = "text-lg text-gray-700 mt-4 max-w-[25rem] mx-auto">Ready to crush your goals? Create a new workout and let&apos;s make today count!</p>
         </div>
         <div className = "flex justify-center w-full mx-auto">
            <WorkoutForm
               workout = {undefined}
               state = {state}
               dispatch = {dispatch}
               reset = {handleReset}
               cover = {
                  <Button type = "button" className = "bg-primary text-white w-full h-[2.6rem] p-4" icon = {faPlus}>
                     New Workout
                  </Button>
               }
            />
         </div>
         {
            <div className = "w-full mx-auto flex flex-col justify-center items-center">
               <div className = "relative w-10/12 flex justify-start items-center text-left gap-2 my-2">
                  <div className = "w-full flex flex-col justify-start  gap-2">
                     <Input input = {state.workoutsSearch} label = "Search" icon = {faPersonRunning} dispatch = {dispatch} />
                     <div className = "w-full flex flex-row justify-between items-center gap-2">
                        <div className = "flex flex-row gap-2">
                           <FilterByDate state = {state} dispatch = {dispatch} reset = {handleReset} />
                           <FilterByTags state = {state} dispatch = {dispatch} reset = {handleReset} />
                        </div>
                     </div>
                  </div>
               </div>
               <div className = "relative w-10/12 flex justify-start items-center text-left gap-2 mt-2">
                  <Button
                     onClick = {() => setView("table")}
                     className = {clsx("transition duration-300 ease-in-out", {
                        "scale-105 border-b-4 border-b-primary rounded-none": view === "table"
                     })}>
                     Table
                  </Button>
                  <Button
                     onClick = {() => setView("cards")}
                     className = {clsx("transition duration-300 ease-in-out", {
                        "scale-105  border-b-4 border-b-primary rounded-none": view === "cards"
                     })}>
                     Cards
                  </Button>
               </div>
               {
                  view === "table" ? (
                     <WorkoutTable workouts = {workoutsSection} state = {state} dispatch = {dispatch} reset = {handleReset} />
                  ) : (
                     <WorkoutCards workouts = {workoutsSection} state = {state} dispatch = {dispatch} reset = {handleReset} />
                  )
               }
               {
                  results.length > 0 && (
                     <Pagination workouts = {results} state = {state} dispatch = {dispatch} />
                  )
               }
            </div>
         }
      </main >
   );
}