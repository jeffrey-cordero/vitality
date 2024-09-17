import Button from "@/components/global/button";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import ImageSelection from "@/components/home/workouts/image-selection";
import TagSelection from "@/components/home/workouts/tag-selection";
import { AuthenticationContext } from "@/app/layout";
import { FormState, formReducer } from "@/lib/global/form";
import { fetchWorkoutTags, Tag } from "@/lib/workouts/workouts";
import { faArrowRotateLeft, faPersonRunning, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useContext, useEffect, useReducer } from "react";

const form: FormState = {
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
            fetchedInfo: false
         }
      }
   },
   response: null
};

export default function WorkoutForm(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const [state, dispatch] = useReducer(formReducer, form);
   
   const fetchTags = async() => {
       // Fetch the user workout tag options, if any
       if (user !== undefined) {
         const options: Tag[] = (await fetchWorkoutTags(user.id)).body.data.tags;

         dispatch({
            type: "updateInput",
            value: {
               ...state.inputs.tags,
               data: {
                  ...state.inputs.tags.data,
                  options: options,
                  selected: [],
                  fetchedInfo: true
               }
            }
         });
      }
   }

   useEffect(() => {
      if (state.inputs.tags.data?.fetchedInfo === false) {
         fetchTags();
      }
   }, [state.inputs.tags.data?.fetchedInfo, user]);

   const handleSubmit = (event: FormEvent) => {
      event.preventDefault();
      return;
   };

   return (
      <form
         className="relative"
         onSubmit={handleSubmit}>
         <div className="flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon={faPersonRunning}
               className="text-6xl text-primary mt-1"
            />
            <h1 className="text-3xl font-bold text-black mb-2">
               New Workout
            </h1>
         </div>

         <div className="relative mt-2 w-full flex flex-col justify-center align-center text-left gap-3">
            <FontAwesomeIcon
               icon={faArrowRotateLeft}
               onClick={() => dispatch({
                  type: "resetForm", value: {
                     // Reset selected tags data
                     tags: {
                        ...state.inputs.tags.data,
                        selected: []
                     }
                  }
               })}
               className="absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
            />
            <Input input={state.inputs.title} label="&#x1F58A; Title" dispatch={dispatch} />
            <Input input={state.inputs.date} label="&#x1F4C5; Date" dispatch={dispatch} />
            <Input input={state.inputs.search} label="&#x1F50E; Tags" dispatch={dispatch} />
            <TagSelection input={state.inputs.tags} label="Tags " dispatch={dispatch} state={state} />
            <TextArea input={state.inputs.description} label="&#x1F5DE; Description" dispatch={dispatch} />
            <ImageSelection input={state.inputs.image} label="&#x1F587; URL" dispatch={dispatch} />
            <Button type="submit" className="bg-primary text-white h-[2.6rem]" icon={faSquarePlus}>
               Create
            </Button>
         </div>
      </form>
   );
}