"use client";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
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
            message = "Your ultimate companion for achieving optimal health and fitness"
         />
         <div className = "relative mx-auto mb-12 mt-4 overflow-hidden md:container xsm:mt-8 sm:my-8 md:my-12">
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
                                    alt = "exercise-image"
                                    className = "rounded-2xl shadow-lg dark:shadow-md dark:shadow-slate-950"
                                 />
                              </div>
                              <div className = "relative">
                                 <Image
                                    priority
                                    width = { 640 }
                                    height = { 960 }
                                    quality = { 100 }
                                    src = "/landing/food.jpg"
                                    alt = "food-image"
                                    className = "size-full rounded-2xl shadow-lg dark:shadow-md dark:shadow-slate-950"
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
                                 alt = "biking-image"
                                 className = "size-full rounded-2xl shadow-lg dark:shadow-md dark:shadow-slate-950"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className = "w-full lg:w-5/12">
                     <div className = "flex flex-col items-center justify-center text-center">
                        <Counter />
                        <span className = "mx-2 mb-3 block w-10/12 text-[1.6rem] font-bold text-primary xxsm:text-3xl sm:w-4/5">
                           Level Up Your Fitness
                        </span>
                        <p className = "mx-auto mb-4 w-10/12 text-[0.9rem] font-normal text-gray-500 xxsm:text-base sm:w-2/3 dark:text-gray-400">
                           Track your fitness journey to gain insights, stay accountable, and boost motivation
                           as you work toward your goals.
                        </p>
                        <Link href = "/signup">
                           <Button
                              icon = { faCalendarDays }
                              className = "h-[2.8rem] whitespace-nowrap bg-primary px-4 py-3 text-sm text-white xxsm:w-40 xxsm:px-2 xxsm:text-base"
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