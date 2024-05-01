'use client'
import { FormEvent, useState } from 'react';
import { sendFeedback } from '@/lib/feedback';
import { Input, TextArea, useFormInput } from '@/components/global/form';
import { Notification } from '@/components/global/notification';
import { SubmissionStatus } from '@/lib/form';
import Heading from '@/components/home/heading';
import Button from '@/components/global/button';

function ResponseForm(): JSX.Element {
   const [status, setStatus] = useState<SubmissionStatus>( { state: 'Initial' } );

   const feedback = {
      'name' : useFormInput(''),
      'email' : useFormInput(''),
      'message' : useFormInput('')
   }

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();

      const response = await sendFeedback({
         name: feedback.name.value,
         email: feedback.email.value,
         message: feedback.message.value,
      });

      setStatus(response);

      console.log(response);

      if (response.errors) {
         for (const input of Object.keys(response.errors)) {
            feedback[input].setError(response.errors[input][0]);
         }
      }   
   }

   return (
      <div className='w-full mx-auto my-8'>
         <form
            className='w-1/2 mx-auto flex flex-col justify-center align-center gap-3'
            onSubmit={handleSubmit}>
            <Input
               label='Name'
               inputId='name'
               inputType='text'
               value={feedback.name.value}
               error={feedback.name.error}
               onChange={feedback.name.onChange}
            />
            <Input
               label='Email'
               inputId='email'
               inputType='email'
               value={feedback.email.value}
               error={feedback.email.error}
               onChange={feedback.email.onChange}
            />
            <TextArea
               label='Message'
               inputId='message'
               value={feedback.message.value}
               error={feedback.message.error}
               onChange={feedback.message.onChange}
            />
            {status.state !== 'Initial' && status.state != 'Error' && (
               <Notification
                  status={status}
               />
            )}
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

export default function FeedbackForm(): JSX.Element {
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