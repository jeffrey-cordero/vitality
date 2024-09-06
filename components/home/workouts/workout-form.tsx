import { AuthenticationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import ImageSelection from "@/components/home/workouts/image-selection";
import TagSelection from "@/components/home/workouts/tag-selection";
import { initialFormState, FormState, formReducer } from "@/lib/global/form";
import { faArrowRotateLeft, faPersonRunning, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useContext, useEffect, useReducer } from "react";

const form: FormState = {
   ...initialFormState,
   inputs: {
      title: {
         type: "text",
         id: "title",
         value: "",
         error: null
      },
      date: {
         type: "date",
         id: "date",
         value: "",
         error: null
      },
      description: {
         type: "text",
         id: "description",
         value: "",
         error: null
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
      },
      tags: {
         type: "tags",
         id: "tags",
         value: "",
         error: null,
         data: {
            options: [],
            handlesChanges: true,
            fetchedOptions: false
         }
      }
   }
};

export default function WorkoutForm(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, form);
   const { user } = useContext(AuthenticationContext);

   useEffect(() => {
      if (state.inputs.tags.data?.fetchedOptions === false) {
         // Fetch the user workout tag options, if any
         dispatch({
            type: "updateInput",
            value: {
               ...state.inputs.tags,
               data: {
                  options: [{
                     userId: user?.id,
                     title: "HELLO",
                     color: "#829dda"
                  }],
                  handlesChanges: true,
                  fetchedOptions: true,
               }
            }
         });
      }
   });

   const handleSubmit = (event: FormEvent) => {
      event.preventDefault();
      return;
   };

   return (
      <form
         className = "relative"
         onSubmit = {handleSubmit}>
         <div className = "flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon = {faPersonRunning}
               className = "text-6xl text-primary mt-1"
            />
            <h1 className = "text-3xl font-bold text-black mb-2">
               New Workout
            </h1>
         </div>

         <div className = "relative mt-2 w-full flex flex-col justify-center align-center text-left gap-3">
            <FontAwesomeIcon
               icon = {faArrowRotateLeft}
               onClick = {() => dispatch({
                  type: "resetForm", value: null
               })}
               className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
            />
            <Input input = {state.inputs.title} label = "&#x1F58A; Title" dispatch = {dispatch} />
            <Input input = {state.inputs.date} label = "&#x1F4C5; Date" dispatch = {dispatch} />
            <Input input = {state.inputs.search} label = "&#x1F50E; Tags" dispatch = {dispatch} />
            <TagSelection input = {state.inputs.tags} label = "Tags " dispatch = {dispatch} data={{search: state.inputs.search.value as string}} />
            <TextArea input = {state.inputs.description} label = "&#x1F5DE; Description" dispatch = {dispatch} />
            <ImageSelection input = {state.inputs.image} label = "&#x1F587; URL" dispatch = {dispatch} />
            <Button type = "submit" className = "bg-primary text-white h-[2.6rem]" icon = {faSquarePlus}>
               Create
            </Button>
         </div>
      </form>
   );
}