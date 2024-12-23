"use client";
import { faCheck, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRef } from "react";

import Button from "@/components/global/button";
import Heading from "@/components/global/heading";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  price: string;
  type: string;
  subscription: string;
  text: string;
}

function Card(props: CardProps): JSX.Element {
   const { children, price, type, text, subscription } = props;
   const linkRef = useRef<HTMLAnchorElement>(null);

   return (
      <div
         className = "relative mx-2 flex h-[32rem] w-[29rem] max-w-full items-center justify-center rounded-2xl bg-white text-center shadow-md xsm:mx-0 xsm:h-[33rem] md:w-80 dark:bg-slate-800"
      >
         <div
            className = "flex size-full justify-center rounded-2xl bg-white text-center dark:bg-slate-800"
         >
            <div className = "relative flex flex-col items-center justify-center">
               <span className = "mb-3 block text-[1.6rem] font-extrabold text-primary xxsm:text-[1.7rem] xsm:text-3xl">
                  { type }
               </span>
               <h2 className = "mx-auto w-10/12 border-b-[3px] border-b-slate-400 pb-2 text-[1.7rem] font-bold xxsm:pb-3 xxsm:text-3xl xsm:w-11/12 xsm:text-4xl">
                  { price }
                  <span className = "text-base font-medium">
                     / { subscription }
                  </span>
               </h2>
               <div className = "my-6 flex h-auto flex-col justify-center gap-6 px-2 font-semibold">
                  { children }
               </div>
               <Link
                  ref = { linkRef }
                  href = "/signup"
               >
                  <Button
                     icon = { faWandMagicSparkles }
                     className = "h-12 w-40 whitespace-nowrap bg-primary p-3 text-[0.95rem] text-white xxsm:w-44 xsm:w-48 xsm:text-base"
                  >
                     { text }
                  </Button>
               </Link>
            </div>
         </div>
      </div>
   );
}

interface BulletProps {
   text: string;
}

function Bullet(props: BulletProps): JSX.Element {
   const { text } = props;

   return (
      <span className = "flex flex-row items-center justify-center gap-[0.4rem] text-[0.9rem] xxsm:text-[0.95rem] xsm:text-base">
         <FontAwesomeIcon
            icon = { faCheck }
            className = "text-xl text-primary"
         />
         { text }
      </span>
   );
}

export default function Pricing(): JSX.Element {
   return (
      <div className = "mx-auto w-full">
         <Heading
            title = "Choose Your Plan"
            description = "Select a plan that best suits your needs and goals"
         />
         <div className = "mx-auto w-full">
            <div className = "container relative mx-auto my-8 flex flex-row flex-wrap items-center justify-center gap-8 xsm:p-2 xl:flex-nowrap">
               <Card
                  type = "Regular"
                  price = "$0"
                  subscription = "year"
                  text = "Select Regular"
               >
                  <>
                     <Bullet text = "Basic Features" />
                     <Bullet text = "Workout tracking" />
                     <Bullet text = "Fitness goal setting" />
                     <Bullet text = "Basic analytics" />
                     <Bullet text = "Limited support" />
                  </>
               </Card>
               <Card
                  type = "Member"
                  price = "$99"
                  subscription = "year"
                  text = "Select Member"
               >
                  <>
                     <Bullet text = "All Regular features" />
                     <Bullet text = "Advanced tracking" />
                     <Bullet text = "Personalized nutrition" />
                     <Bullet text = "Enhanced analytics" />
                     <Bullet text = "Priority support" />
                  </>
               </Card>
               <Card
                  type = "Veteran"
                  price = "$199"
                  subscription = "year"
                  text = "Select Veteran"
               >
                  <>
                     <Bullet text = "All Member features" />
                     <Bullet text = "Exclusive workouts" />
                     <Bullet text = "Personalized coaching" />
                     <Bullet text = "24/7 premium support" />
                     <Bullet text = "Early feature access" />
                  </>
               </Card>
            </div>
         </div>
      </div>
   );
}