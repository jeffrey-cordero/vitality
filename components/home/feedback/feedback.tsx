"use client";
import TextArea from "@/components/global/textarea";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import Input from "@/components/global/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faBook, faEnvelope, faFeather } from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useContext, useReducer } from "react";
import { VitalityState, formReducer, VitalityResponse } from "@/lib/global/state";
import { Feedback, sendFeedback } from "@/lib/feedback/feedback";
import { NotificationContext } from "@/app/layout";

const feedback: VitalityState = {
   name: {
      value: "",
      error: null,
      data: {}
   },
   email: {
      value: "",
      error: null,
      data: {}
   },
   message: {
      value: "",
      error: null,
      data: {}
   }
};

function Form(): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, feedback);

   const handleSubmit = async(event: FormEvent) => {
      event.preventDefault();

      try {
         const payload: Feedback = {
            name: state.name.value.trim(),
            email: state.email.value.trim(),
            message: state.message.value.trim()
         };
         const response: VitalityResponse<null> = await sendFeedback(payload);

         if (response.status !== "Error") {
            // Display the success or failure notification to the user
            updateNotification({
               status: response.status,
               message: response.body.message
            });
         } else {
            dispatch({
               type: "displayErrors",
               value: response
            });
         }
      } catch (error) {
         console.error(error);
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
                  type: "resetState", value: {}
               })}
               className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
            />
            <Input id = "name" type = "text" label = "Name" icon = {faFeather} input = {state.name} dispatch = {dispatch} autoFocus required />
            <Input id = "email" type = "text" label = "Email" icon = {faEnvelope} input = {state.email} dispatch = {dispatch} required />
            <TextArea id = "message" type = "text" label = "Message" icon = {faBook} input = {state.message} dispatch = {dispatch} required />
            <Button type = "submit" className = "bg-primary text-white h-[2.6rem]">
               Submit
            </Button>
         </form>
      </div>
   );
}

export default function FeedbackForm(): JSX.Element {
   return (
      <div className = "w-full mx-auto flex flex-col items-center justify-center">
         <Heading
            title = "We're here for your health"
            description = "Please feel free to share any issues or possible  features that may improve your experience"
         />
         <Form />
      </div>
   );
}