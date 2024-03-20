"use client";
import Image from 'next/image'
import clsx from 'clsx';
import cx from "classnames";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Button } from '../global/button';
import { Carousel } from '../global/carousel';


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
      "stars": [1, 1, 1, 1, 0],
      "image": "/testimonial-three.jpg"
   },
   {
      "testimonial": "As a busy professional, finding time for fitness can be challenging. However, this app has made it incredibly convenient for me to stay active throughout the day. Its seamless integration with my smart devices allows me to effortlessly track my activity levels and make healthier choices.",
      "name": "David Smith",
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
      "name": "Daniel Brown",
      "stars": [1, 1, 1, 1, 1],
      "image": "/testimonial-six.jpg"
   }
]

function Testimonial(data: TestimonialData): JSX.Element {
   return (
      <div className="flex flex-col gap-3 justify-between align-center w-10/12 mx-auto h-80 p-5 my-6">
         <FontAwesomeIcon icon={faQuoteLeft} className="text-3xl text-blue-700" />
         <p className="font-medium text-sm h-80 my-8">{data.testimonial}</p>
         <div>
            <div className="relative flex flex-row gap-7 justify-center align-center w-full mx-auto p-5">
               <div className='w-12 h-12 overflow-hidden'>
                  <Image
                     fill
                     style =  {{objectFit: "cover", width: "100%", height: "100%"}}
                     quality={100}
                     src = {data.image}
                     className='rounded-full'
                     alt="Rounded avatar"
                  />


               </div>
               <div className="relative w-full mx-auto h-60 mt-10">
                  <p className="font-bold text-lg">{data.name}</p>
                  {
                     data.stars.map((rating, index) => {
                        return <FontAwesomeIcon key={index} icon={faStar} className={clsx('text-sm', {
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
   const testimonialElements : JSX.Element[] = people.map((person, index) => {
      return (
         <Testimonial {...person} key = {index} />
      );
   })

   return (
      <div className='w-7/12 mx-auto m-12'>
         <Carousel items = {testimonialElements} slideWidth = {100} slideHeight = {450} />
      </div>
   )
}