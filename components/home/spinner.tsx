"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function Counter({
   value,
   className,
   start = 0,
   duration = 800,
}: {
   value: number;
   className: string;
   start?: number;
   duration?: number;
}) {
   const [count, setCount] = useState<number>(start);
   const easeOutQuad = (t: number, b: number, c: number, d: number) => {
      t = t > d ? d : t / d;
      return Math.round(-c * t * (t - 2) + b);
   };

   useEffect(() => {
      let startTime: number | undefined;
      const animateCount = (timestamp: number) => {
         if (!startTime) startTime = timestamp;
         const timePassed = timestamp - startTime;
         const progress = timePassed / duration;
         const currentCount = easeOutQuad(progress, 0, value, 1);
         if (currentCount >= value) {
            setCount(value);
            return;
         }
         setCount(currentCount);
         requestAnimationFrame(animateCount);
      };
      requestAnimationFrame(animateCount);
   }, [value, duration]);

   return <p className={className}>{Intl.NumberFormat().format(count)}</p>;
}

export default function Spinner() {
   return (
      <div className="relative h-full w-full my-[5rem] hover:cursor-pointer hover:scale-[1.05] transition duration-300 ease-in-out">
         <motion.svg
            className="absolute inset-0 m-auto"
            viewBox="0 0 100 100"
            width={120}
            height={120}
         >
            <motion.circle
               initial={{ pathLength: 0 }}
               animate={{ pathLength: 1 }}
               whileInView={{ pathLength: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.5, duration: 3, ease: "easeOut" }}
               strokeWidth={7}
               strokeDasharray="0 1"
               strokeLinecap="round"
               transform="rotate(-90 50 50)"
               cx="50"
               cy="50"
               r="45"
               fill="#DCFCE7"
               stroke="#22C55E"
            />
         </motion.svg>
         <Counter
            value={100}
            duration={3500}
            className="relative inset-0 mx-auto flex items-center justify-center font-display text-4xl text-green-500"
         />
      </div>
   );
}