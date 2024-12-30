"use client";
import { faArrowRotateLeft, faAt, faComments, faPaperPlane, faSignature } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useReducer, useRef } from "react";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Heading from "@/components/global/heading";
import { Input } from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import { formReducer, VitalityState } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { Feedback, sendFeedback } from "@/lib/home/feedback/feedback";

const form: VitalityState = {
   name: {
      id: "name",
      value: "",
      error: null
   },
   email: {
      id: "email",
      value: "",
      error: null
   },
   message: {
      id: "email",
      value: "",
      error: null
   }
};

export default function Login(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, form);
   const submitButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const submitFeedback = useCallback(async() => {
      const payload: Feedback = {
         user_id: user.id,
         name: state.name.value.trim(),
         email: state.email.value.trim(),
         message: state.message.value.trim()
      };

      const response: VitalityResponse<boolean> = await sendFeedback(user.id, payload);

      processResponse(response, dispatch, updateNotifications, () => {
         // Display success message
         updateNotifications({
            status: response.status,
            message: response.body.message,
            timer: 2500
         });

         // Reset form fields
         dispatch({
            type: "resetState",
            value: form
         });
      });
   }, [
      user.id,
      state.name,
      state.email,
      state.message,
      updateNotifications
   ]);

   const submitFeedbackUpdates = useCallback(() => {
      submitButtonRef.current?.submit();
   }, []);

   return (
      <div className = "mx-auto mb-12 flex w-full flex-col items-center justify-center text-center">
         <Heading
            title = "Feedback"
            message = "We value your input! Share your thoughts on improvements or fixes to help us serve you better."
         />
         <div className = "mx-auto mt-12 w-11/12 sm:w-3/4 lg:w-7/12 2xl:w-5/12">
            <div className = "relative flex w-full flex-col items-stretch justify-center gap-3">
               <FontAwesomeIcon
                  icon = { faArrowRotateLeft }
                  onClick = {
                     () => {
                        dispatch({
                           type: "resetState",
                           value: form
                        });
                     }
                  }
                  className = "absolute right-[10px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-primary"
               />
               <Input
                  id = "name"
                  type = "text"
                  label = "Name"
                  autoComplete = "name"
                  icon = { faSignature }
                  input = { state.name }
                  dispatch = { dispatch }
                  onSubmit = { submitFeedbackUpdates }
                  required
               />
               <Input
                  id = "email"
                  type = "email"
                  label = "Email"
                  autoComplete = "email"
                  icon = { faAt }
                  input = { state.email }
                  dispatch = { dispatch }
                  onSubmit = { submitFeedbackUpdates }
                  required
               />
               <TextArea
                  id = "message"
                  type = "text"
                  label = "Message"
                  autoComplete = "none"
                  icon = { faComments }
                  input = { state.message }
                  onSubmit = { submitFeedbackUpdates }
                  dispatch = { dispatch }
               />
               <Button
                  ref = { submitButtonRef }
                  type = "button"
                  className = "h-[2.6rem] bg-primary text-white"
                  icon = { faPaperPlane }
                  onSubmit = { submitFeedback }
                  onClick = { submitFeedbackUpdates }
                  isSingleSubmission = { true }
                  inputIds = { ["name", "email", "message"] }
               >
                  Submit
               </Button>
            </div>
         </div>
      </div>
   );
}