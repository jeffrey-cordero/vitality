import Button from "@/components/global/button";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import ImageSelection from "@/components/home/workouts/image-selection";
import { initialFormState, FormState, formReducer, constructPayload, FormPayload, FormResponse } from "@/lib/global/form";
import { faArrowRotateLeft, faPersonRunning, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useReducer } from "react";

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
         error: null
      },
      tags: {
         type: "tags",
         id: "image",
         value: [],
         options: [],
         error: null
      }
   }
};

export default function WorkoutForm(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, form);

   const handleSubmit = (event: FormEvent) => {
      event.preventDefault();
      console.log("TODO");
      return;
   };

   return (
      <form
         className = "relative"
         onSubmit = {handleSubmit}>
         <div className = "flex flex-col justify-center align-center text-center gap-3">
            <FontAwesomeIcon
               icon = {faPersonRunning}
               className = "text-4xl text-primary mt-1"
            />
            <h1 className = "text-3xl font-bold text-primary mb-2">
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
            <Input input = {state.inputs.title} label = "Title *" dispatch = {dispatch} />
            <Input input = {state.inputs.date} label = "Date *" dispatch = {dispatch} />
            <ImageSelection input = {state.inputs.image} label = "URL *" dispatch = {dispatch} />
            <TextArea input = {state.inputs.description} label = "Description" dispatch = {dispatch} />
            <Button type = "submit" className = "bg-primary text-white h-[2.6rem]" icon = {faSquarePlus}>
               Create
            </Button>
         </div>
      </form>
   );
}