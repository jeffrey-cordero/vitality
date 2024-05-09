"use client";
import clsx from "clsx";
import Heading from "@/components/landing/heading";
import Carousel from "@/components/global/carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft, faStar } from "@fortawesome/free-solid-svg-icons";

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
];

function Testimonial (data: TestimonialData): JSX.Element {
   return (
      <div className = "flex flex-col gap-1 justify-center align-center w-full min-h-[25rem] max-h-ful mx-auto p-8">
         <FontAwesomeIcon icon = {faQuoteLeft} className = "text-4xl text-blue-700" />
         <p className = "font-semibold text-md w-3/4 mx-auto my-4">{data.testimonial}</p>
         <div>
            <div className = "flex flex-row flex-wrap gap-3 justify-center items-center w-full mx-auto p-5">
               <img
                  className = "rounded-full w-[4.5rem] h-[4.5rem] object-cover object-center shadow-2xl"
                  src = {data.image}
                  alt = "Rounded avatar"
               />
               <div>
                  <p className = "font-bold text-md xsm:text-sm">{data.name}</p>
                  {
                     data.stars.map((rating, index) => {
                        return <FontAwesomeIcon key = {index} icon = {faStar} className = {clsx("text-xl sm:text-sm my-2", {
                           "text-yellow-500": rating,
                           "text-slate-500": !rating,
                        })} />;
                     })
                  }
               </div>
            </div>
         </div>

      </div>
   );
}

export default function Testimonials (): JSX.Element {
   const testimonialElements: JSX.Element[] = people.map((person, index) => {
      return (
         <Testimonial {...person} key = {index} />
      );
   });

   return (
      <div className = "w-full mx-auto">
         <Heading
            title = "Testimonials"
            description = "Discover the firsthand experiences of our valued users as they share insights into their fitness journey with our app"
         />
         <div className = "w-8/12 lg:-w-10/12 mx-auto">
            <Carousel items = {testimonialElements} columns = {1} />
         </div>
      </div>
   );
}