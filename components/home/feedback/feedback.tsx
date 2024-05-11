"use client";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import Notification from "@/components/global/notification";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import { FormEvent } from "react";
import { useImmer } from "use-immer";
import { FormItems, handleFormErrors, SubmissionStatus } from "@/lib/form";
import { Feedback, sendFeedback } from "@/lib/feedback";

function Form (): JSX.Element {
   const [status, setStatus] = useImmer<SubmissionStatus>({ state: "Initial", response: {}, errors: {} });
   const [feedback, setFeedback] = useImmer<FormItems>(
      {
         name: {
            label: "Name *",
            type: "text",
            id: "name",
            value: "",
            error: null,
         },email: {
            label: "Email *",
            type: "email",
            id: "email",
            value: "",
            error: null,
         }, message: {
            label: "Message *",
            id: "message",
            value: "",
            error: null,
         },
      });

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();

      try {
         const payload: Feedback = {
            name: feedback.name.value,
            email: feedback.email.value,
            message: feedback.message.value,
         };

         setStatus(await sendFeedback(payload));
         handleFormErrors(status, setFeedback);
      } catch (error) {
         console.error("Error updating status:", error);
         setStatus({ state: "Initial", response: {}, errors: {} });
      }
   };

   return (
      <div className = "w-full mx-auto">
         <form
            className = "w-1/2 mx-auto flex flex-col justify-center align-center gap-3"
            onSubmit = {handleSubmit}
         >
            <Input input = {feedback.name} updater = {setFeedback} />
            <Input input = {feedback.email} updater = {setFeedback} />
            <TextArea input = {feedback.message} updater = {setFeedback} />
            {status.state === "Success" && (
               <Notification status = {status} children={""} />
            )}
            <Button
               type = "submit"
               className = "bg-primary text-white h-[2.5rem]"
            >
               Submit
            </Button>
         </form>
      </div>
   );
}

export default function FeedbackForm (): JSX.Element {
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