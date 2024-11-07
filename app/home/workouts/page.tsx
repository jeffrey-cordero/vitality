"use client";
import Filter from "@/components/home/workouts/filter";
import View from "@/components/home/workouts/view";
import Form from "@/components/home/workouts/form";
import Pagination from "@/components/home/workouts/pagination";
import { AuthenticationContext } from "@/app/layout";
import { fetchWorkouts, Workout } from "@/lib/workouts/workouts";
import { fetchWorkoutTags } from "@/lib/workouts/tags";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { formReducer, VitalityState } from "@/lib/global/state";
import { searchForTitle } from "@/lib/workouts/shared";

const workouts: VitalityState = {
   // Global filtering inputs
   search: {
      value: "",
      error: null,
      data: {}
   },
   type: {
      value: "Is on or after",
      error: null,
      data: {}
   },
   min: {
      value: "",
      error: null,
      data: {}
   },
   max: {
      value: "",
      error: null,
      data: {}
   },
   // User tags
   tags: {
      value: null,
      error: null,
      data: {
         fetched: false,
         dictionary: {},
         options: [],
         selected: [],
         filterSelected: [],
         handlesChanges: true
      }
   },
   // Current editing workout
   workout: {
      value: {
         id: "",
         user_id: "",
         title: "",
         date: new Date(),
         image: "",
         description: "",
         tagIds: [],
         exercises: []
      },
      error: null,
      data: {
         // Interning edit/create form
         display: false
      }
   },
   // User workouts
   workouts: {
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
   paging: {
      value: 10,
      error: null,
      data: {
         handlesChanges: true
      }
   },
   page: {
      value: 0,
      error: null,
      data: {
         handlesChanges: true
      }
   }
};

export default function Page(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const [globalState, globalDispatch] = useReducer(formReducer, workouts);
   const [view, setView] = useState<"table" | "cards" | "">("");

   // Convert search string to lower case for case-insensitive comparison
   const search: string = useMemo(() => {
      return globalState.search.value.trim().toLowerCase();
   }, [globalState.search]);

   // Filtered based on selected tags or date intervals
   const filtered: Workout[] = globalState.workouts.data.filtered;

   // Search results for workouts, accounting for pagination
   const results: Workout[] = useMemo(() => {
      return searchForTitle(filtered, search);
   }, [filtered, search]);

   const paging: number = globalState.paging.value;
   const page: number = globalState.page.value;

   const low: number = page * paging;
   const high = low + paging;

   const workoutsSection: Workout[] = useMemo(() => {
      return results.slice(low, high);
   }, [results, low, high]);

   const fetchWorkoutsData = useCallback(async() => {
      if (user !== undefined && globalState.workouts.data.fetched === false) {
         try {
            const [workoutsData, tagsData] = await Promise.all([
               fetchWorkouts(user.id),
               fetchWorkoutTags(user.id)
            ]);

            globalDispatch({
               type: "initializeState",
               value: {
                  tags: {
                     ...globalState.tags,
                     data: {
                        ...globalState.tags.data,
                        options: tagsData,
                        selected: [],
                        filteredSelected: [],
                        dictionary: Object.fromEntries(tagsData.map(tag => [tag.id, tag])),
                        fetched: true
                     }
                  },
                  workout: {
                     data: {
                        ...globalState.workout.data
                     },
                     value: {
                        ...globalState.workout.value,
                        user_id: user.id
                     }
                  },
                  workouts: {
                     ...globalState.workouts,
                     value: workoutsData,
                     data: {
                        ...globalState.workouts.data,
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
   }, [globalState.tags, globalState.workout.data, globalState.workout.value, globalState.workouts, user]);

   useEffect(() => {
      if (!(globalState.workouts.data.fetched)) {
         setView(window.localStorage.getItem("view") === "table" ? "table" : "cards");
         fetchWorkoutsData();
      }
   }, [fetchWorkoutsData, globalState.workouts.data.fetched, globalState.tags, globalState.workouts, view]);

   return (
      <main className = "relative w-full lg:w-11/12 mx-auto mt-8 flex flex-col justify-start items-center text-center overscroll-y-none">
         <Filter
            globalState = {globalState}
            globalDispatch = {globalDispatch} />
         <View
            view = {view}
            setView = {setView}
            workouts = {workoutsSection}
            globalState = {globalState}
            globalDispatch = {globalDispatch} />
         <Form
            globalState = {globalState}
            globalDispatch = {globalDispatch} />
         <Pagination
            workouts = {results}
            globalState = {globalState}
            globalDispatch = {globalDispatch} />
      </main>
   );
}