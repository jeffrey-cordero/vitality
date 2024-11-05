import Link from "next/link";
import Image from "next/image";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import Ring from "@/components/landing/ring";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";

export default function Journey(): JSX.Element {
   return (
      <div className = "w-full mx-auto">
         <Heading
            title = "Your Fitness Journey Starts Here"
            description = "Your ultimate companion for achieving optimal health and fitness"
         />
         <div className = "overflow-hidden my-4">
            <div className = "container mx-auto">
               <div className = "flex flex-wrap items-center justify-center">
                  <div className = "w-full lg:w-6/12">
                     <div className = "flex items-center mx-3 sm:-mx-4">
                        <div className = "w-full sm:px-4 xl:w-1/2">
                           <div className = "pb-3 sm:pb-4">
                              <div className = "relative my-4">
                                 <Image
                                    priority
                                    width = {2010}
                                    height = {1441}
                                    quality = {100}
                                    src = "/landing/journey.jpg"
                                    alt = ""
                                    className = "w-full h-full shadow-sm rounded-2xl"
                                 />
                              </div>
                              <div className = "relative">
                                 <Image
                                    priority
                                    width = {640}
                                    height = {960}
                                    quality = {100}
                                    src = "/landing/food.jpg"
                                    alt = ""
                                    className = "w-full h-full shadow-sm rounded-2xl"
                                 />
                              </div>
                           </div>

                        </div>
                        <div className = "w-full px-3 sm:px-4 xl:w-1/2">
                           <div className = "py-3 sm:py-4">
                              <Image
                                 priority
                                 width = {1920}
                                 height = {2880}
                                 quality = {100}
                                 src = "/landing/mountains.jpg"
                                 alt = ""
                                 className = "w-full h-full shadow-sm rounded-2xl"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className = "w-full lg:w-5/12">
                     <div className = "flex flex-col items-center justify-center text-center">
                        <Ring />
                        <span className = "block mb-6 mx-6 w-11/12 sm:w-4/5 text-2xl md:text-3xl font-bold text-primary">
                           Level Up Your Fitness
                        </span>
                        <p className = "w-10/12 sm:w-2/3 mx-auto mb-8 font-medium text-sm md:text-md text-slate-500">
                           Discover the power of tracking your fitness journey as you strive towards your goals. By monitoring your progress, you gain valuable insights, stay accountable, and fuel your motivation.
                        </p>
                        <Link href = "/signup">
                           <Button
                              icon = {faBullseye}
                              className = "text-white text-md bg-primary whitespace-nowrap w-[10rem] h-[2.6rem] hover:scale-[1.05] transition duration-300 ease-in-out">
                              Start Today
                           </Button>
                        </Link>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}