"use client";
import Image from 'next/image'
import clsx from 'clsx';
import cx from "classnames";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";


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
      stars: [1, 1, 1, 0, 0],
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
      "stars": [1, 1, 1, 0, 0],
      "image": "/testimonial-six.jpg"
   }
]


function CarouselItem({color, text, index} : {color : string, text: string, index: number}): JSX.Element {
   // Need to wrap the Testimonial in this React Component
   return(
      <div className={cx("flex align-center justify-center items-center", color)} style={{height:700}}>
         <h1 className="font-bold text-3xl">{text}</h1>
      </div>
   )
}

function Carousel(): JSX.Element {
   const [currentIndex, setCurrentIndex] = useState(0);
   const slides = [
      <CarouselItem color='bg-red-500' text = 'SLIDE 1' index = {1} key={1} />,
      <CarouselItem color='bg-blue-500' text = 'SLIDE 2' index = {2} key={2} />,
      <CarouselItem color='bg-yellow-500' text = 'SLIDE 3' index = {3} key={3} />,
      <CarouselItem color='bg-green-500' text = 'SLIDE 4' index = {4} key={4} />,
      <CarouselItem color='bg-purple-500' text = 'SLIDE 5' index = {5} key={5} />,
      <CarouselItem color='bg-blue-500' text = 'SLIDE 6' index = {6} key={6} />,
   ];

   const nextSlide = () => {
      setCurrentIndex((currentIndex + 2) % slides.length);
   };

   const prevSlide = () => {
      setCurrentIndex((currentIndex - 2 + slides.length) % slides.length);
   };

   const slideWidth = 100 / 2;

   return (

      <div className="relative bg-gray-200 rounded-2xl shadow-2xl overflow-hidden" style={{height:700}}>
         <div
          className="carousel-inner flex transition-transform duration-500"
          style={{
            transform: `translateX(-${currentIndex * slideWidth}%)`
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={clsx("carousel-item flex-shrink-0", {
                'w-full': index === currentIndex || index === currentIndex - 1 || index === currentIndex + 1,
                'opacity-50': index !== currentIndex && index !== currentIndex - 1 && index !== currentIndex + 1,
              })}
              style={{ width: `${slideWidth}%` }}
            >
              {slide}
            </div>
          ))}
        </div>


         <div className="carousel-buttons">
            <button type="button" className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" onClick={prevSlide}>
               <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                  <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
                  </svg>
                  <span className="sr-only">Previous</span>
               </span>
            </button>
            <button type="button" className="absolute top-1/2 -translate-y-1/2 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-next onClick={nextSlide}>
               <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                  <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                  </svg>
                  <span className="sr-only">Next</span>
               </span>
            </button>
         </div>
      </div>
   );
};


function Testimonial(data: TestimonialData): JSX.Element {
   return (
      <div className="flex flex-col gap-3 justify-between align-center w-10/12 mx-auto h-80 p-5 my-6">
         <FontAwesomeIcon icon={faQuoteLeft} className="text-3xl text-blue-700" />
         <p className="font-medium text-sm h-80 my-8">{data.testimonial}</p>
         <div>
            <div className="flex flex-row gap-7 justify-center align-center w-full mx-auto p-5">
               <div className="flex align-center justify-center rounded-full shadow-2xl h-24 w-24 ">
                  {/* <Image
                     src={data.image}
                     width={1000}
                     height={1000}
                     alt='Testimonial Image'
                  /> */}
               </div>


               <div className="w-full mx-auto h-60 mt-10">
                  <p className="font-bold text-md">{data.name}</p>
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
   return (
      <div className='my-11 pb-12'>
         <Carousel />
         {/* {people.map((person, index) => {
            return (
               <Testimonial
                  testimonial={person.testimonial}
                  name={person.name}
                  stars={person.stars}
                  image={person.image}
                  key={index}
               />
            )
         })} */}
         {/* <Carousel /> */}

      </div>
   )
}