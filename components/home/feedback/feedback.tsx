"use client";
import { FormEvent } from "react";
import { useImmer } from "use-immer";
import { SubmissionStatus, update } from "@/lib/form";
import { sendFeedback, Feedback } from "@/lib/feedback";
import Input from "@/components/global/input";
import TextArea from "@/components/global/textarea";
import Notification from "@/components/global/notification";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";

function Form (): JSX.Element {
   const [feedback, setFeedback] = useImmer<Feedback>({ name: "", email: "", message: "" });
   const [status, setStatus] = useImmer<SubmissionStatus>({ state: "Initial", response: {}, errors: {} });

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();

      try {
         // TODO - construct valid payload and fix handling state
         setStatus(await sendFeedback(feedback));
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
            <Input
               label = "Name"
               id = "name"
               type = "text"
               error = {status.errors.name?.[0] ?? null}
               onChange = {(event) => {update(event, setFeedback, setStatus); } }
            />
            <Input
               label = "Email"
               id = "email"
               type = "email"
               error = {status.errors.email?.[0] ?? null}
               onChange = {(event) => {update(event, setFeedback, setStatus); } }
            />
            <TextArea
               label = "Message"
               id = "message"
               error = {status.errors.message?.[0] ?? null}
               onChange = {(event) => {update(event, setFeedback, setStatus); } }
            />
            {status.state !== "Initial" && status.state !== "Error" && (
               <Notification
                  status = {status}
               />
            )}

            <Button
               type = "submit"
               className = "bg-primary text-white"
            >
               Submit
            </Button>
         </form>
      </div>
   );
}

export default function SignUpForm (): JSX.Element {
   return (
      <>
         <div className = "w-full mx-auto flex flex-col items-center justify-center">
            <Heading
               title = "Sign up"
               description = "Create an account to get started"
            />
            <Form />
         </div>
      </>
   );
}