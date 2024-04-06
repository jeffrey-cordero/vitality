"use client"
import Heading from "@/components/home/heading";
import { Button } from "@/components/global/button";
import Input from "../global/input";
import { ChangeEvent, FormEvent, useState } from "react";
import TextArea from "../global/textarea";
import { sendFeedback } from '@/lib/actions';
import { FeedbackForm } from '@/lib/definitions';

function ResponseForm(): JSX.Element {
   const [survey, setSurvey] = useState<FeedbackForm>({name: "", email: "", message: ""});
   const handleFormChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void  => {
      setSurvey({ ...survey, [String(event.target.dataset.state)]: event.target.value });
   };

   return (
      <div className="w-full mx-auto my-8">
         <form
            className="w-1/2 mx-auto flex flex-col justify-center align-center gap-3"
            onSubmit={async (event: FormEvent)=> {
                        event.preventDefault();
                        const response = await sendFeedback(survey);
                        alert(response);
                     }}>
            <Input
               label="Full Name"
               inputId="user-full-name"
               inputType="text"
               state="name"
               onChange={handleFormChange}
            />
            <Input
               label="Email"
               inputId="user-email"
               inputType="email"
               state="email"
               onChange={handleFormChange}
            />
            <TextArea
               label="Message"
               inputId="user-message"
               state="message"
               onChange={handleFormChange}
            />
            <Button
               type="submit"
               className="bg-blue-700 text-white hover:scale-[1.01]"
               >
               Submit
            </Button>
         </form>
      </div>
   );
}

export default function Feedback(): JSX.Element {
   return (
      <>
         <div className="w-full mx-auto">
            <Heading
               title="Your Fitness Journey Starts Here"
               description="Welcome to our fitness tracker app – your ultimate companion for achieving optimal health and fitness"
            />
            <ResponseForm />
         </div>
      </>
   );
}