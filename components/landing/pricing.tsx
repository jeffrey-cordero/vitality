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
         className = "relative flex justify-center items-center w-[22rem] md:w-[20.5rem] h-[33.5rem] mx-2 xsm:mx-0 container">
         <div
            className = "w-full h-full flex justify-center text-center rounded-2xl bg-white dark:bg-slate-800 shadow-md"
            { ...doubleTap }>
            <div className = "relative flex flex-col justify-center align-center">
               <span className = "mb-3 block text-3xl font-extrabold text-primary">
                  { type }
               </span>
               <h2 className = "w-11/12 mx-auto text-4xl font-bold text-dark pb-6 border-b-[3px] border-b-slate-400">
                  { price }
                  <span className = "text-base font-medium text-body-color">
                     / { subscription }
                  </span>
               </h2>
               <div className = "my-6 flex flex-col justify-center gap-6 h-[14rem] font-semibold px-2">
                  { children }
               </div>
               <Link
                  ref = { linkRef }
                  href = "/signup">
                  <Button
                     icon = { faWandMagicSparkles }
                     className = "max-w-[90%] w-[12rem] mx-auto rounded-md border border-primary bg-primary p-3 text-center text-white cursor-pointer">
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
      <div className = "w-full mx-auto">
         <Heading
            title = "Choose Your Plan"
            description = "Select a plan that best suits your needs and goals"
         />
         <div className = "w-full mx-auto">
            <div className = "relative container mx-auto flex flex-row flex-wrap justify-center align-center gap-8 p-2 my-8">
               <PricingCard
                  type = "Regular"
                  price = "$0"
                  subscription = "year"
                  text = "Select Regular">
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
                  text = "Select Member">
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
                  text = "Select Veteran">
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