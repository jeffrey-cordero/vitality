"use client";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";

import { AuthenticationContext } from "@/app/layout";
import Main from "@/components/global/main";
import Filtering from "@/components/home/workouts/filtering";
import Form from "@/components/home/workouts/form";
import Pagination from "@/components/home/workouts/pagination";
import View from "@/components/home/workouts/view";
import { formReducer, VitalityState } from "@/lib/global/reducer";
import { emptyWorkout } from "@/lib/home/workouts/shared";
import { fetchWorkoutTags, Tag } from "@/lib/home/workouts/tags";
import { fetchWorkouts, Workout } from "@/lib/home/workouts/workouts";

const form: VitalityState = {
   search: {
      id: "search",
      value: "",
      error: null
   },
   dateFilter: {
      id: "dateFilter",
      value: "Is on or after",
      error: null
   },
   minDate: {
      id: "minDate",
      value: "",
      error: null
   },
   maxDate: {
      id: "maxDate",
      value: "",
      error: null
   },
   tags: {
      id: "tags",
      value: [],
      error: null,
      handlesChanges: true,
      data: {
         options: [],
         selected: [],
         filtered: [],
         dictionary: {},
         fetched: false
      }
   },
   workouts: {
      id: "workouts",
      value: [],
      error: null,
      data: {
         selected: new Set<Workout>(),
         appliedDateFiltering: false,
         appliedTagsFiltering: false,
         filtered: [],
         fetched: false
      }
   },
   workout: {
      id: "workout",
      value: {
         ...emptyWorkout
      },
      error: null,
      data: {
         display: false
      }
   },
   paging: {
      id: "paging",
      value: 10,
      error: null,
      handlesChanges: true
   },
   page: {
      id: "page",
      value: 0,
      error: null,
      handlesChanges: true
   }
};

const pagingValues = new Set<number>([5, 10, 25, 50, 100, 500, 1000]);

export default function Page(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const [globalState, globalDispatch] = useReducer(formReducer, form);
   const [view, setView] = useState<"table" | "cards">("table");

   // Search value for workouts based on title
   const search: string = useMemo(() => {
      return globalState.search.value.trim().toLowerCase();
   }, [globalState.search]);

   // Case-insensitive workout title search results
   const results: Workout[] = useMemo(() => {
      const filtered: Workout[] = globalState.workouts.data?.filtered;
      const lower: string = search.toLowerCase();

      return search === "" ? filtered : filtered.filter(
         (workout) => workout.title.toLowerCase().includes(lower)
      );
   }, [
      search,
      globalState.workouts.data?.filtered
   ]);

   // Pagination calculations for workouts section
   const paging: number = globalState.paging.value;
   const page: number = globalState.page.value;

   const section: Workout[] = useMemo(() => {
      const low: number = page * paging;
      const high: number = low + paging;

      return results.slice(low, high);
   }, [
      page,
      paging,
      results
   ]);

   const fetchUserWorkouts = useCallback(async() => {
      // Fetch user workouts and workout tags
      const [workoutsData, tagsData] = await Promise.all([
         fetchWorkouts(user.id),
         fetchWorkoutTags(user.id)
      ]);

      // Ensure paging and page localStorage values align with pagination setup values
      let paging: number = Number.parseInt(window.localStorage.getItem("paging") ?? "10");

      if (!(pagingValues.has(paging))) {
         paging = 10;
         window.localStorage.setItem("paging", String(paging));
      }

      const pages: number = Math.ceil(workoutsData.length / paging);
      let page: number = Number.parseInt(window.localStorage.getItem("page") ?? "0");

      if (page >= pages || page < 0) {
         page = Math.max(0, pages - 1);
         window.localStorage.setItem("page", String(page));
      }

      globalDispatch({
         type: "updateStates",
         value: {
            tags: {
               data: {
                  options: tagsData,
                  selected: [],
                  filtered: [],
                  dictionary: Object.fromEntries(
                     tagsData.map((tag: Tag) => [tag.id, tag]),
                  ),
                  fetched: true
               }
            },
            workouts: {
               value: workoutsData,
               data: {
                  filtered: workoutsData,
                  appliedDateFiltering: false,
                  appliedTagsFiltering: false,
                  fetched: true
               }
            },
            workout: {
               value: {
                  user_id: user.id
               }
            },
            paging: {
               value: paging
            },
            page: {
               value: page
            }
         }
      });
   }, [user]);

   useEffect(() => {
      if (!globalState.workouts.data?.fetched) {
         setView(window.localStorage.getItem("view") === "cards" ? "cards" : "table");

         fetchUserWorkouts();
      }
   }, [
      user,
      view,
      globalState.tags,
      fetchUserWorkouts,
      globalState.workouts,
      globalState.workouts.data?.fetched
   ]);

   return (
      <Main className = "mb-12">
         <Filtering
            globalState = { globalState }
            globalDispatch = { globalDispatch }
         />
         <View
            view = { view }
            setView = { setView }
            workouts = { section }
            globalState = { globalState }
            globalDispatch = { globalDispatch }
         />
         <Form
            globalState = { globalState }
            globalDispatch = { globalDispatch }
         />
         <Pagination
            workouts = { results }
            globalState = { globalState }
            globalDispatch = { globalDispatch }
         />
      </Main>
   );
}