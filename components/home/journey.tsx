import Image from 'next/image'
import Heading from '@/components/home/heading';
import Button from '@/components/global/button';

export default function Journey(): JSX.Element {
   return (
      <div className='w-full mx-auto'>
         <Heading
            title='Your Fitness Journey Starts Here'
            description='Welcome to our fitness tracker app – your ultimate companion for achieving optimal health and fitness'
         />
         <div className='relative w-7/12 mx-auto mt-12'>
            <div className='w-full shadow-2xl min-w-full'>
               <Image
                  src='/journey.jpg'
                  width={1200}
                  height={550}
                  alt='Journey Image'
                  priority
               />
            </div>
            <div className='absolute top-0 right-0 lg:w-[26rem] w-[19rem] shadow-2xl' style={{ transform: 'translate(50%, 80%)' }}>
               <div className=' text-white bg-blue-700 flex flex-col justify-center align-center gap-5 text-left p-8 shadow-2xl'>
                  <h1 className='text-2xl font-bold'>
                     Transformation
                  </h1>
                  <p className='text-md font-light'>
                     Discover the power of tracking your fitness journey as you strive towards your goals. By monitoring your progress, you gain valuable insights, stay accountable, and fuel your motivation.
                  </p>
                  <Button className='text-blue-700 text-md bg-white whitespace-nowrap w-[8rem] text-sm p-2 '>
                     Start Today
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
}