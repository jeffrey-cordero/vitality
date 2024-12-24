"use client";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";

import { AuthenticationContext } from "@/app/layout";
import Main from "@/components/global/main";
import Filtering from "@/components/home/workouts/filtering";
import Form from "@/components/home/workouts/form";
import Pagination from "@/components/home/workouts/pagination";
import View from "@/components/home/workouts/view";
import { formReducer, VitalityState } from "@/lib/global/reducer";
import { fetchWorkoutTags } from "@/lib/home/workouts/tags";
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
         id: "",
         user_id: "",
         title: "",
         date: new Date(),
         image: "",
         description: "",
         exercises: [],
         tagIds: []
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

   const search: string = useMemo(() => {
      return globalState.search.value.trim().toLowerCase();
   }, [globalState.search]);

   // Case-insensitive title comparison for workouts search
   const results: Workout[] = useMemo(() => {
      const filtered: Workout[] = globalState.workouts.data?.filtered;
      const lower = search.toLowerCase();

      return search === "" ?
         filtered : filtered.filter((w) => w.title.toLowerCase().includes(lower));
   }, [
      globalState.workouts.data?.filtered,
      search
   ]);

   // Pagination calculations
   const paging: number = globalState.paging.value;
   const page: number = globalState.page.value;

   const workoutsSection: Workout[] = useMemo(() => {
      const low: number = page * paging;
      const high = low + paging;

      return results.slice(low, high);
   }, [
      results,
      paging,
      page
   ]);

   const fetchWorkoutsData = useCallback(async() => {
      // Fetch user workouts and workout tags for global state
      const [workoutsData, tagsData] = await Promise.all([
         fetchWorkouts(user.id),
         fetchWorkoutTags(user.id)
      ]);

      // Ensure paging and page localStorage values align with pagination setup
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
                     tagsData.map((tag) => [tag.id, tag]),
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
         setView(
            window.localStorage.getItem("view") === "cards" ? "cards" : "table",
         );

         fetchWorkoutsData();
      }
   }, [
      user,
      fetchWorkoutsData,
      globalState.workouts.data?.fetched,
      globalState.tags,
      globalState.workouts,
      view
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
            workouts = { workoutsSection }
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