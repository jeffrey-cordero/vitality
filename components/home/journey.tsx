import Image from 'next/image'
import Heading from "@/components/home/heading";
import { Button } from '../global/button'

export default function Journey(): JSX.Element {
   return (
      <div className="w-full mx-auto">
         <Heading
            title="Your Fitness Journey Starts Here"
            description="Welcome to our fitness tracker app – your ultimate companion for achieving optimal health and fitness"
         />
         <div className="relative w-7/12 mx-auto mt-12">
            <div className="w-full shadow-2xl">
               <Image
                  src='/journey.jpg'
                  width={1200}
                  height={550}
                  alt='Journey Image'
               />
            </div>
            <div className='absolute top-0 right-0 lg:w-96 z-10 shadow-2xl ' style={{ transform: 'translate(50%, 50%)' }}>
               <div className=' text-white bg-blue-700 flex flex-col justify-center align-center gap-8 text-left p-12 shadow-2xl'>
                  <h1 className='text-2xl font-bold'>
                     The Journey
                  </h1>
                  <p className='text-md font-light'>
                     Discover the power of tracking your fitness journey as you strive towards your goals. By monitoring your progress, you gain valuable insights, stay accountable, and fuel your motivation.
                  </p>
                  <Button className="text-blue-700 text-medium bg-white whitespace-nowrap w-40 text-md px-4 py-2 ">
                     Start Today
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
}