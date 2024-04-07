"use client";
import Image from 'next/image'
import clsx from 'clsx';
import Heading from "@/components/home/heading";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft, faStar } from "@fortawesome/free-solid-svg-icons";
import Carousel from "@/components/global/carousel";

interface TestimonialData {
   testimonial: string,
   name: string,
   stars: number[],
   image: string
}

const people: TestimonialData[] = [
   {
      testimonial: "This app has revolutionized the way I approach my fitness routine. Its seamless interface and user-friendly design make tracking workouts, steps, and calories a simple and enjoyable task. With just a few taps, I can access all the data I need to stay on track towards my fitness goals.",
      name: "Micheal Wong",
      stars: [1, 1, 1, 1, 1],
      image: "/testimonial-one.jpg"
   },
   {
      testimonial: "I've tried numerous fitness apps in the past, but none compare to the user-friendly experience and comprehensive features of this one. From tracking my daily steps to monitoring my heart rate during workouts, this app covers all the bases.",
      name: "Avril Song",
      stars: [1, 1, 1, 1, 1],
      image: "/testimonial-two.jpg"
   },
   {
      "testimonial": "I've always struggled with maintaining a consistent fitness routine, but this app has completely changed the game for me. Its intuitive features and motivational reminders keep me accountable and motivated to reach my fitness goals.",
      "name": "Emily Johnson",
      "stars": [1, 1, 1, 1, 1],
      "image": "/testimonial-three.jpg"
   },
   {
      "testimonial": "As a busy professional, finding time for fitness can be challenging. However, this app has made it incredibly convenient for me to stay active throughout the day. Its seamless integration with my smart devices allows me to effortlessly track my activity levels and make healthier choices.",
      "name": "John Smith",
      "stars": [1, 1, 1, 1, 1],
      "image": "/testimonial-four.jpg"
   },
   {
      "testimonial": "Being a fitness enthusiast, I've tried my fair share of workout apps, but none have impressed me as much as this one. Its comprehensive exercise library caters to all fitness levels, and the customizable workout plans have helped me push my limits and achieve results beyond my expectations.",
      "name": "Sophia Martinez",
      "stars": [1, 1, 1, 1, 1],
      "image": "/testimonial-five.jpg"
   },
   {
      "testimonial": "This app has become my go-to fitness companion for its seamless integration with my daily routine. From tracking my nutrition intake to providing insightful analytics on my sleep patterns, it has empowered me to make informed decisions about my health and well-being.",
      "name": "Daniel Patel",
      "stars": [1, 1, 1, 1, 1],
      "image": "/testimonial-six.jpg"
   }
]

function Testimonial(data: TestimonialData): JSX.Element {
   return (
      <div className="flex flex-col gap-1 justify-between align-center w-10/12 mx-auto h-80 p-5 my-6">
         <FontAwesomeIcon icon={faQuoteLeft} className="text-5xl text-blue-700" />
         <p className="font-medium text-md h-80 my-8">{data.testimonial}</p>
         <div>
            <div className="flex flex-row gap-7 justify-center items-center w-full mx-auto p-5 h-40">
               <div className='relative w-28 h-28 sm:w-20 sm:h-20 overflow-hidden rounded-full bg-slate-600'>
                  <Image
                     fill
                     objectFit="cover"
                     quality={100}
                     src={data.image}
                     alt="Rounded avatar"
                  />
               </div>
               <div>
                  <p className="font-bold text-xl sm:text-md">{data.name}</p>
                  {
                     data.stars.map((rating, index) => {
                        return <FontAwesomeIcon key={index} icon={faStar} className={clsx('text-xl sm:text-sm my-2', {
                           'text-yellow-500': rating,
                           'text-slate-400': !rating,
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
   const testimonialElements: JSX.Element[] = people.map((person, index) => {
      return (
         <Testimonial {...person} key={index} />
      );
   })

   return (
      <div className="w-full mx-auto">
         <Heading
            title="Testimonials"
            description="Discover the firsthand experiences of our valued users as they share insights into their fitness journey with our app"
         />
         <div className='w-7/12 mx-auto'>
            <Carousel items={testimonialElements} slideWidth={100} slideHeight={450} />
         </div>
      </div>
   );
}