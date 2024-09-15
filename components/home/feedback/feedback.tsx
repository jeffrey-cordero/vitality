"use client";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import Notification from "@/components/global/notification";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useReducer } from "react";
import { FormState, formReducer, constructPayload, FormPayload, FormResponse } from "@/lib/global/form";
import { Feedback, sendFeedback } from "@/lib/feedback/feedback";

const formState: FormState = {
   status: "Initial",
   inputs: {
      name: {
         type: "text",
         id: "name",
         value: "",
         error: null,
         data: {}
      },
      email: {
         type: "email",
         id: "email",
         value: "",
         error: null,
         data: {}
      },
      message: {
         type: "text",
         id: "message",
         value: "",
         error: null,
         data: {}
      }
   },
   response: null
};

function Form(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, formState);

   const handleSubmit = async(event: FormEvent) => {
      event.preventDefault();

      try {
         const payload: FormPayload = constructPayload(state.inputs);
         const response: FormResponse = await sendFeedback(payload as Feedback);

         dispatch({
            type: "updateStatus",
            value: response
         });
      } catch (error) {
         console.error("Error updating status:", error);
      }
   };

   return (
      <div className = "w-full mx-auto">
         <form
            className = "relative w-1/2 mx-auto flex flex-col justify-center align-center gap-3"
            onSubmit = {handleSubmit}
         >
            <FontAwesomeIcon
               icon = {faArrowRotateLeft}
               onClick = {() => dispatch({
                  type: "resetForm", value: null
               })}
               className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
            />
            <Input input = {state.inputs.name} label = "Name *" dispatch = {dispatch} />
            <Input input = {state.inputs.email} label = "Email *" dispatch = {dispatch} />
            <TextArea input = {state.inputs.message} label = "Message *" dispatch = {dispatch} />
            <Button type = "submit" className = "bg-primary text-white h-[2.6rem]">
               Submit
            </Button>
            {
               state.status != "Initial" && state.status != "Error" && (
                  <Notification state = {state} />
               )
            }
         </form>
      </div>
   );
}

export default function FeedbackForm(): JSX.Element {
   return (
      <>
         <div className = "w-full mx-auto flex flex-col items-center justify-center">
            <Heading
               title = "We're here for your health"
               description = "Please feel free to share any issues or possible  features that may improve your experience"
            />
            <Form />
         </div>
      </>
   );
}