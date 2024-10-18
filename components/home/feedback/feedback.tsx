"use client";
import TextArea from "@/components/global/textarea";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import Input from "@/components/global/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useContext, useReducer } from "react";
import { VitalityState, formReducer, VitalityResponse } from "@/lib/global/state";
import { Feedback, sendFeedback } from "@/lib/feedback/feedback";
import { NotificationContext } from "@/app/layout";

const feedback: VitalityState = {
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
            <Input input = {state.name} label = "Name *" dispatch = {dispatch} />
            <Input input = {state.email} label = "Email *" dispatch = {dispatch} />
            <TextArea input = {state.message} label = "Message *" dispatch = {dispatch} />
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