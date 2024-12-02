"use client";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import Link from "next/link";
import { useDoubleTap } from "use-double-tap";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";

interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  price: string;
  type: string;
  subscription: string;
  text: string;
}

function PricingCard(props: PricingCardProps): JSX.Element {
   const { children, price, type, text, subscription } = props;
   const linkRef = useRef<HTMLAnchorElement>(null);

   const doubleTap = useDoubleTap(() => {
      linkRef.current?.click();
   });

   return (
      <div
         className = "container relative mx-2 flex h-[33.5rem] w-[22rem] items-center justify-center xsm:mx-0 md:w-[20.5rem]"
      >
         <div
            className = "flex size-full justify-center rounded-2xl bg-white text-center shadow-md dark:bg-slate-800"
            { ...doubleTap }
         >
            <div className = "relative flex flex-col items-center justify-center">
               <span className = "mb-3 block text-3xl font-extrabold text-primary">
                  { type }
               </span>
               <h2 className = "mx-auto w-11/12 border-b-[3px] border-b-slate-400 pb-6 text-4xl font-bold">
                  { price }
                  <span className = "text-base font-medium">
                     / { subscription }
                  </span>
               </h2>
               <div className = "my-6 flex h-56 flex-col justify-center gap-6 px-2 font-semibold">
                  { children }
               </div>
               <Link
                  ref = { linkRef }
                  href = "/signup"
               >
                  <Button
                     icon = { faWandMagicSparkles }
                     className = "mx-auto w-48 max-w-[90%] cursor-pointer rounded-md border border-primary bg-primary p-3 text-center text-white"
                  >
                     { text }
                  </Button>
               </Link>
            </div>
         </div>
      </div>
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
            <div className = "container relative mx-auto my-8 flex flex-row flex-wrap items-center justify-center gap-8 p-2">
               <PricingCard
                  type = "Regular"
                  price = "$0"
                  subscription = "year"
                  text = "Select Regular"
               >
                  <>
                     <p>Basic features</p>
                     <p>Workout tracking</p>
                     <p>Fitness goal setting</p>
                     <p>Basic analytics</p>
                     <p>Limited support</p>
                  </>
               </PricingCard>
               <PricingCard
                  type = "Member"
                  price = "$99"
                  subscription = "year"
                  text = "Select Member"
               >
                  <>
                     <p>All Regular features</p>
                     <p>Advanced tracking</p>
                     <p>Customized fitness plans</p>
                     <p>Enhanced analytics</p>
                     <p>Priority support</p>
                  </>
               </PricingCard>
               <PricingCard
                  type = "Veteran"
                  price = "$199"
                  subscription = "year"
                  text = "Select Veteran"
               >
                  <>
                     <p>All Member features</p>
                     <p>Exclusive workouts</p>
                     <p>Personalized coaching</p>
                     <p>24/7 premium support</p>
                     <p>Early feature access</p>
                  </>
               </PricingCard>
            </div>
         </div>
      </div>
   );
}