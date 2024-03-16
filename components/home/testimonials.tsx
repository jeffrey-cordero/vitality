import Image from 'next/image'
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";



function Testimonial({ testimonial, name, stars, image }: { testimonial: string, name: string, stars: number[], image: string }): JSX.Element {
   return (
      <div className="flex flex-col gap-3 justify-center align-center">
         <FontAwesomeIcon icon={faQuoteLeft} className="text-3xl text-blue-700" />
         <p className="font-medium text-xl">{testimonial}</p>
         <div>
            <div className="flex flex-row justify-center items-center w-24 h-24 rounded-full shadow-md">
               <Image
                  src={image}
                  width={1000}
                  height={1000}
                  alt='Testimonial Image'
               />
               <div>
                  <p className="font-bold text-md">{name}</p>
                  {
                     stars.map((rating, index) => {
                        return <FontAwesomeIcon key={index} icon={faStar} className={clsx('text-xl', {
                           'text-blue-700': rating,
                           'text-white': !rating,
                        })} />
                     })
                  }
               </div>
            </div>
         </div>

      </div>
   )
}

export default function Testimonials(): JSX.Element {
   return (
      <div className='w-full mx-auto p-3 flex flex-row gap-3 justify-center'>
         <Testimonial
            testimonial="This app has revolutionized the way I approach my fitness routine. Its seamless interface and user-friendly design make tracking workouts, steps, and calories a simple and enjoyable task. With just a few taps, I can access all the data I need to stay on track towards my fitness goals."
            name="Micheal Wong"
            stars={[1,1,1,0,0]}
            image="/testimonial-one.jpg"
         />

      </div>
   )
}