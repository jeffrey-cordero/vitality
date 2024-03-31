"use client"
import Heading from "@/components/home/heading";
import { Button } from "@/components/global/button";
import Input from "../global/input";
import { ChangeEvent, ChangeEventHandler, FormEvent, useState } from "react";
import TextArea from "../global/textarea";



type SurveyForm = {
   name: string;
   email: string;
   message: string;
};

async function action(formData: SurveyForm): Promise<void> {
   console.log(formData);
}

function ResponseForm(): JSX.Element {
   const [survey, setSurvey] = useState<SurveyForm>({name: "", email: "", message: ""});

   const handleFormChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void  => {
      setSurvey({ ...survey, [String(event.target.dataset.state)]: event.target.value });
   };

   return (
      <div className="w-full mx-auto my-8">
         <form
            className="w-1/2 mx-auto flex flex-col justify-center align-center gap-3"
            onSubmit={(event: FormEvent)=> {
                        event.preventDefault();
                        action(survey);
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

export default function Survey(): JSX.Element {
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