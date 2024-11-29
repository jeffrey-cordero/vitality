"use client";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import Link from "next/link";
import Tilt from "react-parallax-tilt";
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
      <Tilt
         tiltMaxAngleX = {5}
         tiltMaxAngleY = {5}
         perspective = {1000}
         scale = {1.05}
         transitionSpeed = {300}
         className = "relative cursor-move flex justify-center items-center w-[19.5rem] h-[32rem] mx-2 xsm:mx-0">
         <div
            className = "w-full h-full flex justify-center text-center rounded-2xl border-[1.5px] border-gray-200 bg-white shadow-md"
            {...doubleTap}>
            <div className = "relative flex flex-col justify-center align-center">
               <span className = "mb-3 block text-3xl font-extrabold text-primary">
                  {type}
               </span>
               <h2 className = "w-11/12 mx-auto text-4xl font-bold text-dark pb-6 border-b-[2px] border-b-slate-400">
                  {price}
                  <span className = "text-base font-medium text-body-color">
                  / {subscription}
                  </span>
               </h2>
               <div className = "my-5 px-2 flex flex-col justify-center gap-4 h-[12.5rem] font-medium text-base text-body-color">
                  {children}
               </div>
               <Link
                  ref = {linkRef}
                  href = "/signup">
                  <Button
                     icon = {faWandMagicSparkles}
                     className = "w-[12rem] xsm:w-[14rem] mx-auto rounded-md border border-primary bg-primary p-3 text-center text-white cursor-pointer">
                     {text}
                  </Button>
               </Link>
            </div>
         </div>
      </Tilt>
   );
}

export default function Pricing(): JSX.Element {
   return (
      <div className = "w-full mx-auto">
         <Heading
            title = "Choose Your Plan"
            description = "Select a plan that best suits your needs and goals"
         />
         <div className = "w-full mx-auto py-6">
            <div className = "relative container mx-auto flex flex-row flex-wrap justify-center align-center gap-8 p-2 py-6">
               <PricingCard
                  type = "Regular"
                  price = "$0"
                  subscription = "year"
                  text = "Choose Regular">
                  <>
                     <p>Access to basic features</p>
                     <p>Track your workouts</p>
                     <p>Set fitness goals</p>
                     <p>Basic analytics</p>
                     <p>Limited support</p>
                  </>
               </PricingCard>
               <PricingCard
                  type = "Member"
                  price = "$99"
                  subscription = "year"
                  text = "Choose Member">
                  <>
                     <p>All Regular features</p>
                     <p>Advanced workout tracking</p>
                     <p>Customized fitness plans</p>
                     <p>Enhanced analytics</p>
                     <p>Priority support</p>
                  </>
               </PricingCard>
               <PricingCard
                  type = "Veteran"
                  price = "$199"
                  subscription = "year"
                  text = "Choose Veteran">
                  <>
                     <p>All Member features</p>
                     <p>Exclusive workouts and challenges</p>
                     <p>Personalized coaching sessions</p>
                     <p>24/7 premium support</p>
                     <p>Early access to new features</p>
                  </>
               </PricingCard>
            </div>
         </div>
      </div>
   );
}
