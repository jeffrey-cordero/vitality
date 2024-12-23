"use client";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";

import Button from "@/components/global/button";
import Heading from "@/components/global/heading";
import Counter from "@/components/landing/counter";

export default function Journey(): JSX.Element {
   return (
      <div className = "mx-auto w-full">
         <Heading
            title = "Your Fitness Journey Starts Here"
            description = "Your ultimate companion for achieving optimal health and fitness"
         />
         <div className = "relative mx-auto mb-8 mt-2 overflow-hidden md:container">
            <div className = "mx-auto w-full sm:px-4">
               <div className = "flex flex-col items-center justify-center lg:flex-row">
                  <div className = "mt-2 w-full lg:mt-0 lg:w-5/12">
                     <div className = "mx-2 flex items-center">
                        <div className = "w-full xl:w-1/2">
                           <div className = "pb-3 sm:pb-4">
                              <div className = "relative my-4">
                                 <Image
                                    priority
                                    width = { 2010 }
                                    height = { 1441 }
                                    quality = { 100 }
                                    src = "/landing/journey.jpg"
                                    alt = ""
                                    className = "rounded-2xl shadow-sm"
                                 />
                              </div>
                              <div className = "relative">
                                 <Image
                                    priority
                                    width = { 640 }
                                    height = { 960 }
                                    quality = { 100 }
                                    src = "/landing/food.jpg"
                                    alt = ""
                                    className = "size-full rounded-2xl shadow-sm"
                                 />
                              </div>
                           </div>
                        </div>
                        <div className = "w-full pl-4 xl:w-1/2">
                           <div className = "py-3 sm:py-4">
                              <Image
                                 priority
                                 width = { 1920 }
                                 height = { 2880 }
                                 quality = { 100 }
                                 src = "/landing/mountains.jpg"
                                 alt = ""
                                 className = "size-full rounded-2xl shadow-sm"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className = "w-full lg:w-5/12">
                     <div className = "flex flex-col items-center justify-center text-center">
                        <Counter />
                        <span className = "mx-2 mb-4 block w-10/12 text-[1.6rem] font-bold text-primary xxsm:text-3xl sm:w-4/5">
                           Level Up Your Fitness
                        </span>
                        <p className = "mx-auto mb-4 w-10/12 text-[0.9rem] font-normal text-gray-500 xxsm:text-base sm:w-2/3 dark:text-gray-400">
                           Track your fitness journey to gain insights, stay accountable, and boost motivation
                           as you work toward your goals.
                        </p>
                        <Link href = "/signup">
                           <Button
                              icon = { faBullseye }
                              className = "h-[2.8rem] w-36 whitespace-nowrap bg-primary p-3 text-base text-white xxsm:w-40"
                           >
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