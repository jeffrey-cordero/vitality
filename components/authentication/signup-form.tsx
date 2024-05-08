"use client";
import { ChangeEvent, FormEvent } from "react";
import { useImmer } from "use-immer";
import { SubmissionStatus } from "@/lib/form";
import { sendFeedback, Feedback } from "@/lib/feedback";
import Heading from "@/components/landing/heading";
import { Input, TextArea } from "@/components/global/form";
import { Notification } from "@/components/global/notification";
import Button from "@/components/global/button";

function Form (): JSX.Element {
   const [feedback, setFeedback] = useImmer<Feedback>({ name: "", email: "", message: "" });
   const [status, setStatus] = useImmer<SubmissionStatus>({ state: "Initial", response: {}, errors: {} });

   const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = event.target;

      setFeedback((feedback: Feedback) => {
         feedback[id] = value;
      });

      setStatus((status: SubmissionStatus) => {
         delete status.errors[id];
      });
   };

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();

      try {
         setStatus(await sendFeedback(feedback));
      } catch (error) {
         console.error("Error updating status:", error);
         setStatus({ state: "Initial", response: {}, errors: {} });
      }
   };

   return (
      <div className = "w-full mx-auto my-8">
         <form
            className = "w-1/2 mx-auto flex flex-col justify-center align-center gap-3"
            onSubmit = {handleSubmit}
         >
            <Input
               label = "Name"
               id = "name"
               type = "text"
               error = {status.errors.name?.[0] ?? null}
               onChange = {handleChange}
            />
            <Input
               label = "Email"
               id = "email"
               type = "email"
               error = {status.errors.email?.[0] ?? null}
               onChange = {handleChange}
            />
            <TextArea
               label = "Message"
               id = "message"
               error = {status.errors.message?.[0] ?? null}
               onChange = {handleChange}
            />
            {(
               <Notification
                  status = {status}
               />
            )}
            {/* status.state !== 'Initial' && status.state !== 'Error' && */}
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

export default function FeedbackForm (): JSX.Element {
   return (
      <>
         <div className = "w-full mx-auto flex items-center justify-center">
            <Heading
               title = "Sign up"
               description = "Create an account to get started"
            />
            <Form />
         </div>
      </>
   );
}