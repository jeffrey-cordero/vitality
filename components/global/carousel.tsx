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
      <div className = "relative w-full mx-auto bg-white rounded-2xl p-2 sm:p-0  shadow-md">
         <div
            className = "carousel-inner flex transition-[opacity,transform] ease-in-out duration-500"
            style = {{
               transform: `translateX(-${currentIndex * columnWidth}%)`
            }}>
            {items.map((slide, index) => (
               <div
                  key = {index}
                  className = {clsx(
                     "flex justify-center items-center p-2 md:p-4 flex-shrink-0 rounded-2xl",
                     {
                        "opacity-100": index === currentIndex,
                        "opacity-30": index !== currentIndex
                     },
                  )}
                  style = {{ width: `${columnWidth}%` }}>
                  {slide}
               </div>
            ))}
         </div>
         <div className = "carousel-buttons">
            <button
               type = "button"
               className = "absolute top-0 -translate-x-1/2 start-0 z-10 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none overflow-visible"
               onClick = {prevSlide}>
               <span className = "inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 group-hover:bg-gray-400 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                  <svg
                     className = "w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
                     aria-hidden = "true"
                     xmlns = "http://www.w3.org/2000/svg"
                     fill = "none"
                     viewBox = "0 0 6 10">
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
               className = "absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none overflow-visible"
               onClick = {nextSlide}>
               <span className = "inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 group-hover:bg-gray-400 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                  <svg
                     className = "w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
                     aria-hidden = "true"
                     xmlns = "http://www.w3.org/2000/svg"
                     fill = "none"
                     viewBox = "0 0 6 10">
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
