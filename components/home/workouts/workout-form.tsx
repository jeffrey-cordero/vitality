import Select from "@/components/global/select";
import { initialFormState, FormState, formReducer, constructPayload, FormPayload, FormResponse } from "@/lib/global/form";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useReducer } from "react";

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
}

export default function WorkoutForm(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, form);

   const handleSubmit = () => {
      console.log("TODO");
   }

   return (
      <form onSubmit = {handleSubmit}>
         <FontAwesomeIcon
            icon = {faArrowRotateLeft}
            onClick = {() => dispatch({
               type: "resetForm", value: null
            })}
            className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer" 
         />
         <Select label="Tags" input={state.inputs.tags} dispatch={dispatch} />
      </form>
   )
}