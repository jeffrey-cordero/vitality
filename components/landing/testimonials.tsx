import clsx from "clsx";
import testimonialData from "@/lib/landing/testimonials";
import Image from "next/image";
import Heading from "@/components/global/heading";
import Carousel from "@/components/global/carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft, faStar } from "@fortawesome/free-solid-svg-icons";

interface TestimonialProps {
   testimonial: string,
   name: string,
   stars: number[],
   image: string
}

const people: TestimonialProps[] = testimonialData;

function Testimonial(props: TestimonialProps): JSX.Element {
   return (
      <div className = "flex flex-col box-border gap-1 justify-center align-center w-full min-h-[25rem] max-h-full mx-auto">
         <FontAwesomeIcon
            icon = {faQuoteLeft}
            className = "text-4xl text-primary" />
         <p className = "font-semibold text-md w-3/4 mx-auto my-4">{props.testimonial}</p>
         <div>
            <div className = "flex flex-row flex-wrap gap-3 justify-center items-center w-full mx-auto p-5">
               <Image
                  priority
                  width = {200}
                  height = {200}
                  quality = {100}
                  className = "rounded-full w-[4.5rem] h-[4.5rem] object-cover object-center shadow-inner"
                  src = {props.image}
                  alt = "Rounded avatar"
               />
               <div>
                  <p className = "font-semibold text-md">{props.name}</p>
                  {
                     props.stars.map((rating, index) => {
                        return <FontAwesomeIcon
                           key = {index}
                           icon = {faStar}
                           className = {clsx("text-lg my-2", {
                              "text-yellow-500": rating,
                              "text-slate-500": !rating
                           })} />;
                     })
                  }
               </div>
            </div>
         </div>
      </div>
   );
}

export default function Testimonials(): JSX.Element {
   const testimonialElements: JSX.Element[] = people.map((person, index) => {
      return (
         <Testimonial
            {...person}
            key = {index} />
      );
   });

   return (
      <div className = "w-full mx-auto">
         <Heading
            title = "Testimonials"
            description = "Discover the firsthand experiences of our valued users as they share insights into their fitness journey with our app"
         />
         <div className = "w-10/12 md:w-8/12 mx-auto">
            <Carousel
               items = {testimonialElements}
               columns = {1} />
         </div>
      </div>
   );
}