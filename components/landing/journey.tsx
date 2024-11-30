"use client";
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
         <div className = "relative md:container mx-auto overflow-hidden my-6">
            <div className = "mx-auto px-4">
               <div className = "flex flex-col lg:flex-row items-center justify-center">
                  <div className = "w-full lg:w-5/12">
                     <div className = "flex items-center mx-3 sm:-mx-1">
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
                                    className = "rounded-2xl shadow-sm hover:scale-[1.05] transition duration-300 ease-in-out"
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
                                    className = "w-full h-full rounded-2xl shadow-sm hover:scale-[1.05] transition duration-300 ease-in-out"
                                 />
                              </div>
                           </div>
                        </div>
                        <div className = "w-full pl-3 sm:px-4 xl:w-1/2">
                           <div className = "py-3 sm:py-4">
                              <Image
                                 priority
                                 width = { 1920 }
                                 height = { 2880 }
                                 quality = { 100 }
                                 src = "/landing/mountains.jpg"
                                 alt = ""
                                 className = "w-full h-full rounded-2xl shadow-sm hover:scale-[1.05] transition duration-300 ease-in-out"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className = "w-full lg:w-5/12">
                     <div className = "flex flex-col items-center justify-center text-center">
                        <Ring />
                        <span className = "block mb-4 mx-2 w-10/12 sm:w-4/5 text-3xl font-bold text-primary">
                           Level Up Your Fitness
                        </span>
                        <p className = "w-10/12 sm:w-2/3 mx-auto mb-6 font-normal text-md  text-slate-500">
                           Track your fitness journey to gain insights, stay accountable, and boost motivation
                           as you work toward your goals.
                        </p>
                        <Link href = "/signup">
                           <Button
                              icon = { faBullseye }
                              className = "text-white text-md bg-primary whitespace-nowrap w-[10.5rem] h-[2.8rem] text-md p-3">
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