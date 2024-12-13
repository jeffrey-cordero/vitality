import clsx from "clsx";
import Image from "next/image";
import testimonials from "@/lib/landing/testimonials";
import Heading from "@/components/global/heading";
import Carousel from "@/components/landing/carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft, faStar } from "@fortawesome/free-solid-svg-icons";

interface TestimonialProps {
  testimonial: string;
  name: string;
  stars: number[];
  image: string;
}

function Testimonial(props: TestimonialProps): JSX.Element {
   const { testimonial, name, stars, image } = props;

   return (
      <div className = "relative mx-auto box-border flex max-h-full min-h-[22rem] w-full flex-col justify-center gap-1 py-2 sm:py-0 md:min-h-80">
         <FontAwesomeIcon
            icon = { faQuoteLeft }
            className = "text-[1.6rem] text-primary sm:text-3xl"
         />
         <p className = "mx-auto mt-3 w-11/12 px-2 text-[0.9rem] font-medium xxsm:text-[0.95rem] sm:w-3/4 sm:text-base">
            { testimonial }
         </p>
         <div>
            <div className = "mx-auto flex w-full flex-col items-center justify-center gap-3 px-4 pt-4 sm:flex-row">
               <Image
                  priority
                  width = { 200 }
                  height = { 200 }
                  quality = { 100 }
                  className = "size-[4.5rem] rounded-full object-cover object-center shadow-inner"
                  src = { image }
                  alt = "Rounded avatar"
               />
               <div>
                  <p className = "text-[0.95rem] font-bold xxsm:text-base">
                     { name }
                  </p>
                  {
                     stars.map((rating, index) => {
                        return (
                           <FontAwesomeIcon
                              key = { index }
                              icon = { faStar }
                              className = {
                                 clsx("my-2 text-sm", {
                                    "text-yellow-500": rating,
                                    "text-slate-500": !rating
                                 })
                              }
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
            description = "Explore firsthand stories from our users, sharing their fitness journeys with our app"
         />
         <div className = "mx-auto my-8 w-10/12 lg:w-7/12">
            <Carousel
               items = { elements }
               columns = { 1 }
            />
         </div>
      </div>
   );
}