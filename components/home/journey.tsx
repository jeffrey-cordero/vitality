import Image from 'next/image'

export default function Journey(): JSX.Element {


   return (
      <div className="relative w-100">
         <Image
            src='/journey.png'
            width={800}
            height={800}
            className='mt-12'
            alt='journey'
         />
         <div className='absolute text-white bg-blue-700 shadow-2xl w-80  h-80 top-32 right-0 z-10 flex flex-col justify-between align-center gap-4 text-left p-7'>
            <h1 className='text-2xl font-bold'>
               The Journey
            </h1>
            <p className='text-md font-light'>
               Discover the power of tracking your fitness journey as you strive towards your goals. By monitoring your progress, you gain valuable insights, stay accountable, and fuel your motivation. 
            </p>
            <a href="/signup" className="text-blue-700 text-medium  bg-white focus:shadow-2xl focus:ring-4 focus:ring-slate-200 font-bold rounded-lg w-36 text-md px-6 py-2 focus:outline-none transition-transform transform hover:scale-105">Start Today</a>
         </div>
      </div>
   )
}