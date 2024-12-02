"use client";
import clsx from "clsx";
import { useState } from "react";

interface CarouselProps {
  items: JSX.Element[];
  columns: number;
}

export default function Carousel(props: CarouselProps): JSX.Element {
   const { columns, items } = props;
   const [currentIndex, setCurrentIndex] = useState(Math.floor(items.length / 2));
   const columnWidth = columns * 100;

   const nextSlide = () => {
      setCurrentIndex(
         (prevIndex) => (prevIndex + 1) % items.length
      );
   };

   const prevSlide = () => {
      setCurrentIndex(
         (prevIndex) => (prevIndex - 1 + items.length) % items.length
      );
   };

   return (
      <div className = "relative mx-auto w-full rounded-2xl bg-white p-2 shadow-md sm:p-0 dark:bg-slate-800">
         <div
            className = "flex transition-[opacity,transform] duration-500 ease-in-out"
            style = {
               {
                  transform: `translateX(-${currentIndex * columnWidth}%)`
               }
            }
         >
            {
               items.map((slide, index) => (
                  <div
                     key = { index }
                     className = {
                        clsx(
                           "flex shrink-0 items-center justify-center rounded-2xl p-2 md:p-4",
                           {
                              "opacity-100": index === currentIndex,
                              "opacity-30": index !== currentIndex
                           },
                        )
                     }
                     style = { { width: `${columnWidth}%` } }
                  >
                     { slide }
                  </div>
               ))
            }
         </div>
         <div>
            <button
               type = "button"
               className = "group absolute start-0 top-0 z-10 flex h-full -translate-x-1/2 cursor-pointer items-center justify-center overflow-visible px-2 focus:outline-none"
               onClick = { prevSlide }
            >
               <span className = "inline-flex size-10 items-center justify-center rounded-full bg-gray-400 group-hover:bg-gray-500 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-300 dark:group-hover:bg-gray-400 dark:group-focus:ring-gray-800/70">
                  <svg
                     className = "size-4 text-white rtl:rotate-180 dark:text-gray-800"
                     aria-hidden = "true"
                     xmlns = "http://www.w3.org/2000/svg"
                     fill = "none"
                     viewBox = "0 0 6 10"
                  >
                     <path
                        stroke = "currentColor"
                        strokeLinecap = "round"
                        strokeLinejoin = "round"
                        strokeWidth = "2"
                        d = "M5 1 1 5l4 4"
                     />
                  </svg>
                  <span className = "sr-only">Previous</span>
               </span>
            </button>
            <button
               type = "button"
               className = "group absolute right-0 top-1/2 z-30 flex h-full -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center overflow-visible px-2 focus:outline-none"
               onClick = { nextSlide }
            >
               <span className = "inline-flex size-10 items-center justify-center rounded-full bg-gray-400 group-hover:bg-gray-500 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-300 dark:group-hover:bg-gray-400 dark:group-focus:ring-gray-800/70">
                  <svg
                     className = "size-4 text-white rtl:rotate-180 dark:text-gray-800"
                     aria-hidden = "true"
                     xmlns = "http://www.w3.org/2000/svg"
                     fill = "none"
                     viewBox = "0 0 6 10"
                  >
                     <path
                        stroke = "currentColor"
                        strokeLinecap = "round"
                        strokeLinejoin = "round"
                        strokeWidth = "2"
                        d = "m1 9 4-4-4-4"
                     />
                  </svg>
                  <span className = "sr-only">Next</span>
               </span>
            </button>
         </div>
      </div>
   );
}