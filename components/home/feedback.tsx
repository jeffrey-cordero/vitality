'use client'
import { ChangeEvent, FormEvent, useState } from 'react';
import { useImmer } from 'use-immer';
import { sendFeedback, FeedbackForm } from '@/lib/feedback';
import Heading from '@/components/home/heading';
import Button from '@/components/global/button';
import Input from '@/components/global/input';
import TextArea from '@/components/global/textarea';


function ResponseForm(): JSX.Element {
   const [feedback, setFeedback] = useImmer<FeedbackForm>({ name: "", email: "", message: "" });

   const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = event.target;
      setFeedback(prevState => ({
         ...prevState,
         [id]: value
      }));
   };

   return (
      <div className='w-full mx-auto my-8'>
         <form
            className='w-1/2 mx-auto flex flex-col justify-center align-center gap-3'
            onSubmit={async (event: FormEvent) => {
               event.preventDefault();
               const response = await sendFeedback(feedback);
               if (response && response.issues) {
                  console.log(response.issues[0]);
               }
            }}>
            <Input
               label='Name'
               inputId='name'
               inputType='text'
               value={feedback.name}
               onChange={handleInputChange}
            />
            <Input
               label='Email'
               inputId='email'
               inputType='email'
               value={feedback.email}
               onChange={handleInputChange}
            />
            <TextArea
               label='Message'
               inputId='message'
               value={feedback.message}
               onChange={handleInputChange}
            />
            <Button
               type='submit'
               className='bg-blue-700 text-white hover:scale-[1.01]'
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
         <div className='w-full mx-auto'>
            <Heading
               title='Your Fitness Journey Starts Here'
               description='Welcome to our fitness tracker app – your ultimate companion for achieving optimal health and fitness'
            />
            <ResponseForm />
         </div>
      </>
   );
}