"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CounterProps {
  value: number;
  className: string;
  start: number;
  duration: number;
}

function Counter(props: CounterProps): JSX.Element {
   const [count, setCount] = useState<number>(props.start);
   const easeOutQuad = (t: number, b: number, c: number, d: number) => {
      t = t > d ? d : t / d;
      return Math.round(-c * t * (t - 2) + b);
   };

   useEffect(() => {
      let startTime: number | undefined;
      const animateCount = (timestamp: number) => {
         if (!startTime) startTime = timestamp;
         const timePassed = timestamp - startTime;
         const progress = timePassed / props.duration;
         const currentCount = easeOutQuad(progress, 0, props.value, 1);
         if (currentCount >= props.value) {
            setCount(props.value);
            return;
         }
         setCount(currentCount);
         requestAnimationFrame(animateCount);
      };
      requestAnimationFrame(animateCount);
   }, [props.value, props.duration]);

   return <p className = {props.className}>{Intl.NumberFormat().format(count)}</p>;
}

export default function Ring(): JSX.Element {
   return (
      <div className = "relative h-full w-full my-[4rem]">
         <motion.svg
            className = "absolute inset-0 m-auto w-[80px] md:w-[100px] h-[80px] md:h-[100px]"
            viewBox = "0 0 100 100">
            <motion.circle
               initial = {{ pathLength: 0 }}
               animate = {{ pathLength: 1 }}
               whileInView = {{ pathLength: 1 }}
               viewport = {{ once: true }}
               transition = {{ delay: 0.3, duration: 3, ease: "easeOut" }}
               strokeWidth = {7}
               strokeDasharray = "0 1"
               strokeLinecap = "round"
               transform = "rotate(-90 50 50)"
               cx = "50"
               cy = "50"
               r = "45"
               fill = "#DCFCE7"
               stroke = "#22C55E"
            />
         </motion.svg>
         <Counter
            value = {100}
            start = {0}
            duration = {3500}
            className = "relative inset-0 mx-auto flex items-center justify-center font-display text-2xl sm:text-3xl text-green-500"
         />
      </div>
   );
}
