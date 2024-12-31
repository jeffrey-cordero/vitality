"use client";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

import Button from "@/components/global/button";
import Heading from "@/components/global/heading";
import Cards from "@/components/landing/cards";

interface PriceProps {
  price: string;
  type: string;
  bullets: string[];
}

function Price(props: PriceProps) {
   const { type, price, bullets } = props;

   return (
      <div className = "mx-auto grid w-full max-w-lg grid-cols-1 items-center gap-y-6 px-8 py-10 text-left xxsm:py-4 xsm:px-12">
         <div className = "relative flex flex-col items-start justify-start gap-y-3">
            <h3 className = "text-[1.2rem]/7 font-bold text-primary">
               { type }
            </h3>
            <p className = "flex items-baseline gap-x-2">
               <span className = "text-4xl font-semibold tracking-tight text-gray-900 xsm:text-[2.4rem] dark:text-white">
                  { price }
               </span>
               <span className = "text-base font-medium text-gray-500 dark:text-gray-400">
                  / month
               </span>
            </p>
         </div>
         <ul className = "space-y-3 text-[0.95rem]/7 font-medium text-gray-500 sm:text-[0.9rem]/7 dark:text-gray-400">
            {
               bullets.map((bullet: string) => {
                  return (
                     <li
                        className = "flex items-center justify-start gap-x-3"
                        key = { bullet }
                     >
                        <svg
                           className = "h-6 w-5 flex-none text-primary"
                           viewBox = "0 0 20 20"
                           fill = "currentColor"
                           aria-hidden = "true"
                           data-slot = "icon"
                        >
                           <path
                              fillRule = "evenodd"
                              d = "M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                              clipRule = "evenodd"
                           />
                        </svg>
                        { bullet }
                     </li>
                  );
               })
            }
         </ul>
         <Link
            href = "/signup"
         >
            <Button
               icon = { faTags }
               className = "h-[2.7rem] w-full whitespace-nowrap bg-primary px-4 py-3 text-base text-white xxsm:px-2 xxsm:text-base"
            >
               Select
            </Button>
         </Link>
      </div>
   );
}

export default function Pricing(): JSX.Element {
   return (
      <div className = "mx-auto w-full">
         <Heading
            title = "Choose Your Plan"
            message = "Select a plan that best suits your needs and goals"
         />
         <Cards
            className = "min-h-[28rem]"
         >
            {
               [
                  <Price
                     type = "Regular"
                     price = "$0"
                     bullets = { ["Basic Features", "Workout tracking", "Fitness goal setting", "Basic analytics", "Limited support"] }
                     key = "price-one"
                  />,
                  <Price
                     type = "Member"
                     price = "$99"
                     bullets = { ["All Regular features", "Advanced tracking", "Personalized nutrition", "Enhanced analytics", "Priority support" ] }
                     key = "price-two"
                  />,
                  <Price
                     type = "Veteran"
                     price = "$199"
                     bullets = { ["All Member features", "Exclusive workouts", "Personalized coaching", "Early feature access", "24/7 premium support"] }
                     key = "price-three"
                  />
               ]
            }
         </Cards>
      </div>
   );
}