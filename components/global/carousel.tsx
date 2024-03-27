import { useState } from "react";
import clsx from 'clsx';

export function Carousel({ items, slideWidth, slideHeight }: { items: JSX.Element[], slideWidth: number, slideHeight: number }): JSX.Element {
   const [currentIndex, setCurrentIndex] = useState(1);

   const nextSlide = () => {
      setCurrentIndex((currentIndex + (100 / slideWidth)) % items.length);

      if (currentIndex > 3) {
         console.log("FIX 1");
      }
   };

   const prevSlide = () => {
      setCurrentIndex((currentIndex - (100 / slideWidth) + items.length) % items.length);

      if (currentIndex < 3) {
         console.log("FIX 2");
      }
   };

   return (
      <div className="relative w-full mx-auto bg-white rounded-2xl shadow-2xl my-6" style={{ height: slideHeight, minHeight: slideHeight, maxHeight: slideHeight }}>
         <div
            className="carousel-inner flex transition-[opacity,transform] ease-in-out duration-500"
            style={{
               transform: `translateX(-${currentIndex * slideWidth}%)`
            }}
         >
            {items.map((slide, index) => (
               <div
                  key={index}
                  className={clsx("carousel-item flex-shrink-0", {
                     'opacity-100': index === currentIndex,
                     'opacity-20': index !== currentIndex,
                  })}
                  style={{ width: `${slideWidth}%`}}
               >
                  {slide}
               </div>
            ))}
         </div>


         <div className="carousel-buttons">
            <button type="button" className="absolute top-0 -translate-x-1/2 start-0 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none overflow-visible" onClick={prevSlide}>
               <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                  <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
                  </svg>
                  <span className="sr-only">Previous</span>
               </span>
            </button>
            <button type="button" className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none overflow-visible" data-carousel-next onClick={nextSlide}>
               <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                  <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                  </svg>
                  <span className="sr-only">Next</span>
               </span>
            </button>
         </div>
      </div>
   );
}
