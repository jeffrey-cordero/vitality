import { faQuoteLeft, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

import Heading from "@/components/global/heading";
import Carousel from "@/components/landing/carousel";
import testimonials from "@/public/landing/testimonials";

interface TestimonialProps {
  testimonial: string;
  name: string;
  image: string;
}

function Testimonial(props: TestimonialProps): JSX.Element {
   const { testimonial, image, name } = props;

   return (
      <div className = "min[450px]:min-h-[19rem] relative mx-auto box-border flex max-h-full min-h-80 w-full flex-col justify-between gap-1 py-3 xsm:justify-center xsm:py-0">
         <FontAwesomeIcon
            icon = { faQuoteLeft }
            className = "text-[1.7rem] text-primary sm:text-3xl"
         />
         <p className = "mx-auto mt-3 w-11/12 px-2 text-[0.9rem] font-medium min-[450px]:text-[0.95rem] sm:w-3/4 sm:text-base">
            { testimonial }
         </p>
         <div className = "relative">
            <div className = "mx-auto flex w-full flex-col items-center justify-center gap-3 px-4 pt-4 sm:flex-row">
               <Image
                  priority
                  width = { 200 }
                  height = { 200 }
                  quality = { 100 }
                  className = "size-[4.4rem] rounded-full object-cover object-center shadow-inner min-[450px]:size-[4.5rem]"
                  src = { image }
                  alt = "Rounded avatar"
               />
               <div className = "relative">
                  <p className = "text-[0.9rem] font-bold min-[450px]:text-[0.95rem]">
                     { name }
                  </p>
                  {
                     Array.from({ length: 5 }, (_, index) => {
                        return (
                           <FontAwesomeIcon
                              key = { index }
                              icon = { faStar }
                              className = "text-sm text-yellow-500 xsm:text-[0.95rem]"
                           />
                        );
                     })
                  }
               </div>
            </div>
         </div>
      </div>
   );
}

export default function Testimonials(): JSX.Element {
   const elements: JSX.Element[] = testimonials.map((person, index) => {
      return (
         <Testimonial
            { ...person }
            key = { index }
         />
      );
   });

   return (
      <div className = "mx-auto w-full">
         <Heading
            title = "Testimonials"
            message = "Explore firsthand stories from our users, sharing their fitness journeys with our app"
         />
         <div className = "mx-auto my-8 w-10/12 md:my-12 md:w-8/12 lg:w-7/12">
            <Carousel
               items = { elements }
               columns = { 1 }
            />
         </div>
      </div>
   );
}