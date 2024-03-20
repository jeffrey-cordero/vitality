import Image from 'next/image'
import { Button } from '../global/button'

export default function Journey(): JSX.Element {


   return (
      <div className="relative w-8/12 mx-auto mt-12">
         <div className='absolute top-1/2 left-1/2 w-96 z-10 shadow-2xl ' style={{ transform: 'translate(40%, -50%)' }}>
            <div className=' text-white bg-blue-700  flex flex-col justify-center align-center gap-8 text-left p-14'>
               <h1 className='text-3xl font-bold'>
                  The Journey
               </h1>
               <p className='text-lg font-light'>
                  Discover the power of tracking your fitness journey as you strive towards your goals. By monitoring your progress, you gain valuable insights, stay accountable, and fuel your motivation.
               </p>
               <Button className = "text-blue-700 text-medium bg-white whitespace-nowrap w-40 text-lg px-4 py-2 ">
                  Start Today
               </Button>
            </div>
         </div>

         <div className="relative top-0 w-full min-w-full mx-auto mt-12 shadow-2xl">
            <Image
               src='/journey.jpg'
               width={1200}
               height={550}
               alt='Journey Image'
            />
         </div>


      </div>
   )
}