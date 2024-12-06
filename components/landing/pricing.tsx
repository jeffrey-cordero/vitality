"use client";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import Link from "next/link";
import { faCheck, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

   return (
      <div
         className = "relative mx-3 flex h-[32rem] w-[29rem] max-w-full items-center justify-center rounded-2xl bg-white text-center shadow-md xsm:mx-0 xsm:h-[33rem] md:w-80 dark:bg-slate-800"
      >
         <div
            className = "flex size-full justify-center rounded-2xl bg-white text-center shadow-md dark:bg-slate-800"
         >
            <div className = "relative flex flex-col items-center justify-center">
               <span className = "mb-3 block text-[1.7rem] font-extrabold text-primary xsm:text-3xl">
                  { type }
               </span>
               <h2 className = "mx-auto w-10/12 border-b-[3px] border-b-slate-400 pb-4 text-3xl font-bold xsm:w-11/12 xsm:text-4xl">
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
                     className = "h-12 w-44 whitespace-nowrap bg-primary p-3 text-[0.95rem] text-white xsm:w-48 xsm:text-base"
                  >
                     { text }
                  </Button>
               </Link>
            </div>
         </div>
      </div>
   );
}

interface PricingItemProps {
   text: string;
}

function PricingItem(props: PricingItemProps): JSX.Element {
   const { text } = props;

   return (
      <span className = "flex flex-row items-center justify-center gap-2 text-[0.95rem] xsm:text-base">
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
               <PricingCard
                  type = "Regular"
                  price = "$0"
                  subscription = "year"
                  text = "Select Regular"
               >
                  <>
                     <PricingItem text = "Basic Features" />
                     <PricingItem text = "Workout tracking" />
                     <PricingItem text = "Fitness goal setting" />
                     <PricingItem text = "Basic analytics" />
                     <PricingItem text = "Limited support" />
                  </>
               </PricingCard>
               <PricingCard
                  type = "Member"
                  price = "$99"
                  subscription = "year"
                  text = "Select Member"
               >
                  <>
                     <PricingItem text = "All Regular features" />
                     <PricingItem text = "Advanced tracking" />
                     <PricingItem text = "Personalized nutrition" />
                     <PricingItem text = "Enhanced analytics" />
                     <PricingItem text = "Priority support" />
                  </>
               </PricingCard>
               <PricingCard
                  type = "Veteran"
                  price = "$199"
                  subscription = "year"
                  text = "Select Veteran"
               >
                  <>
                     <PricingItem text = "All Member features" />
                     <PricingItem text = "Exclusive workouts" />
                     <PricingItem text = "Personalized coaching" />
                     <PricingItem text = "24/7 premium support" />
                     <PricingItem text = "Early feature access" />
                  </>
               </PricingCard>
            </div>
         </div>
      </div>
   );
}