'use client'
import { ChangeEvent, FormEvent, useState } from 'react';
import { useImmer } from 'use-immer';
import { feedback } from '@prisma/client';
import { sendFeedback } from '@/lib/feedback';
import { Input, TextArea } from '@/components/global/form';
import { SubmissionStatus } from '@/lib/form';
import Heading from '@/components/home/heading';
import Button from '@/components/global/button';

import { faSignature, faEnvelope, faMessage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ResponseForm(): JSX.Element {
   const [status, setStatus] = useState<SubmissionStatus>( { status: 'initial', errors: {} } );
   const [feedback, setFeedback] = useImmer<any>({ name: '', email: '', message: '' });

   const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = event.target;
      
      if (status.errors && status.errors.id) {
         // TODO --> remove status of error input
      }

      setFeedback((prevState : any) => ({
         ...prevState,
         [id]: value
      }));
   };

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();

      const response = await sendFeedback(feedback);
      setStatus(response);
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
               value={feedback.name}
               error={status.errors && status.errors.name ? status.errors.name[0] : ''}
               onChange={handleInputChange}
            />
            { status.errors && status.errors.name && 
               <div className="flex justify-center align-center gap-2 p-1 opacity-0 animate-fadein">
                  <FontAwesomeIcon icon={faSignature} className="text-lg text-red-500 mt-1" />
                  <p className='text-red-500 font-semibold '> { status.errors.name[0] } </p>
               </div>  
            }
            <Input
               label='Email'
               inputId='email'
               inputType='email'
               value={feedback.email}
               error={status.errors && status.errors.email ? status.errors.email[0] : ''}
               onChange={handleInputChange}
            />
            { status.errors && status.errors.email && 
               <div className="flex justify-center align-center gap-2 p-1 opacity-0 animate-fadein">
                  <FontAwesomeIcon icon={faEnvelope} className="text-lg text-red-500 mt-1" />
                  <p className='text-red-500 font-semibold '> { status.errors.email[0] } </p>
               </div>  
            }
            <TextArea
               label='Message'
               inputId='message'
               value={feedback.message}
               error={status.errors && status.errors.message ? status.errors.message[0] : ''}
               onChange={handleInputChange}
            />
            { status.errors && status.errors.message && 
               <div className="flex justify-center align-center gap-2 p-1 opacity-0 animate-fadein">
                  <FontAwesomeIcon icon={faMessage} className="text-lg text-red-500 mt-1" />
                  <p className='text-red-500 font-semibold '> { status.errors.message[0] } </p>
               </div>  
            }
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