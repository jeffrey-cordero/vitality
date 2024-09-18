"use client";
import PopUp from "@/components/global/popup";
import WorkoutCard from "@/components/home/workouts/workout-card";
import WorkoutTable from "@/components/home/workouts/workout-table";
import { AuthenticationContext } from "@/app/layout";
import { fetchWorkoutsInformation, fetchWorkoutTags, Tag, Workout } from "@/lib/workouts/workouts";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useReducer, useState } from "react";
import { formReducer, FormState } from "@/lib/global/form";

const workouts: FormState = {
   status: "Initial",
   inputs: {
      title: {
         type: "text",
         id: "title",
         value: "",
         defaultValue: "",
         error: null,
         data: {}
      },
      date: {
         type: "date",
         id: "date",
         value: "",
         defaultValue: "",
         error: null,
         data: {}
      },
      description: {
         type: "text",
         id: "description",
         value: "",
         defaultValue: "",
         error: null,
         data: {}
      },
      image: {
         type: "text",
         id: "image",
         value: "",
         defaultValue: "",
         error: null,
         data: {
            handlesChanges: true
         }
      },
      search: {
         type: "text",
         id: "search",
         value: "",
         defaultValue: "",
         error: null,
         data: {}
      },
      tags: {
         type: null,
         id: "tags",
         value: null,
         defaultValue: null,
         error: null,
         data: {
            options: [],
            selected: [],
            inputs: {
               editTitle: {
                  type: "text",
                  id: "editTitle",
                  value: "",
                  defaultValue: "",
                  error: null,
                  data: {
                     handlesChanges: true,
                  }
               },
               editColor: {
                  type: "text",
                  id: "colors",
                  value: null,
                  defaultValue: "",
                  error: null,
                  data: {
                     handlesChanges: true,
                  }
               },
            },
            handlesChanges: true,
            fetchedOptions: false,
            selectedId: "",
         },
      },
      workouts: {
         type: "N/A",
         id: "workouts",
         value: [],
         defaultValue: null,
         error: null,
         data: {}
      }
   },
   response: null
};

export default function Page() {
   const { user } = useContext(AuthenticationContext);
   const [state, dispatch] = useReducer(formReducer, workouts);

   const fetchWorkouts = async () => {
      if (user !== undefined) {
         // Fetch user tags and workouts in a given Promise.all([])
         let tags: Tag[] = [];
         let workouts: Workout[] = [];

         await Promise.all([
            fetchWorkoutsInformation(user.id).then((data) => {
               workouts = data;
            }),
            fetchWorkoutTags(user.id).then((data) => {
               tags = data;
            })
         ]);


         // Update state for tags and workouts
         dispatch({
            type: "initializeInputs",
            value: {
               tags: {
                  ...state.inputs.tags,
                  data: {
                     ...state.inputs.tags.data,
                     options: tags
                  }
               },
               workouts: {
                  ...state.inputs.workouts,
                  value: workouts
               }
            }
         })
      }

      
   }

   useEffect(() => {
      fetchWorkouts();
   }, [user]);

   return (
      <main className="w-full mx-auto flex gap-2 min-h-screen flex-col items-center justify-start text-center">
         <div>
            <h1 className="text-4xl font-bold mt-8">Welcome Back, Champion!</h1>
            <p className="text-lg text-gray-700 mt-4">Ready to crush your goals? Create a new workout and let&apos;s make today count!</p>
         </div>
         <div className="flex justify-center w-full mx-auto">
            <PopUp text="New Workout"
               className="max-w-4xl"
               buttonClassName="min-w-[9rem] min-h-[2.8rem] text-white text-md font-semibold bg-primary hover:scale-[1.05] transition duration-300 ease-in-out"
               icon={faPlus}>
               {WorkoutCard(undefined, state, dispatch)}
            </PopUp>
         </div>
         {/* <div className="w-10/12 bg-white flex flex-col justify-center items-center gap-12">
            {
               workouts && workouts.map((workout)=> {
                  return WorkoutCard(workout);
               })
            }
         </div> */}
         {WorkoutTable(state.inputs.workouts.value, state, dispatch)}
      </main >
   );
}