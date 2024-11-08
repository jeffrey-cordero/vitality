import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import Link from "next/link";
import { faUsersViewfinder } from "@fortawesome/free-solid-svg-icons";

interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  price: string;
  type: string;
  subscription: string;
  text: string;
}

function PricingCard(props: PricingCardProps): JSX.Element {
   return (
      <div className = "flex justify-center w-[23rem] h-[34rem] max-w-[90%] text-center rounded-2xl border border-gray-200 bg-white shadow-md px-4">
         <div className = "relative flex flex-col justify-center align-center">
            <span className = "mb-3 block text-3xl font-extrabold text-primary">
               {props.type}
            </span>
            <h2 className = "w-11/12 mx-auto text-4xl font-bold text-dark pb-6 border-b-[2px] border-b-slate-400">
               {props.price}
               <span className = "text-base font-medium text-body-color">
            / {props.subscription}
               </span>
            </h2>
            <div className = "my-6 flex flex-col justify-center gap-[14px] h-[12.5rem] font-medium">
               {props.children}
            </div>
            <Link href = "/signup">
               <Button
                  icon = {faUsersViewfinder}
                  className = "block w-full rounded-md border border-primary bg-primary p-3 text-center text-white hover:scale-[1.05] transition duration-300 ease-in-out">
                  {props.text}
               </Button>
            </Link>
         </div>
      </div>
   );
}

function List({ children }: { children: React.ReactNode }): JSX.Element {
   return <p className = "text-base text-body-color">{children}</p>;
}

export default function Pricing(): JSX.Element {
   return (
      <div className = "w-full mx-auto">
         <Heading
            title = "Choose Your Plan"
            description = "Select a plan that best suits your needs and goals"
         />
         <div className = "w-full mx-auto my-4">
            <div className = "w-full mx-auto flex flex-row flex-wrap justify-center align-center gap-16">
               <PricingCard
                  type = "Regular"
                  price = "$0"
                  subscription = "year"
                  text = "Choose Regular">
                  <List>Access to basic features</List>
                  <List>Track your workouts</List>
                  <List>Set fitness goals</List>
                  <List>Basic analytics</List>
                  <List>Limited support</List>
               </PricingCard>
               <PricingCard
                  type = "Member"
                  price = "$99"
                  subscription = "year"
                  text = "Choose Member">
                  <List>All Regular features</List>
                  <List>Advanced workout tracking</List>
                  <List>Customized fitness plans</List>
                  <List>Enhanced analytics</List>
                  <List>Priority support</List>
               </PricingCard>
               <PricingCard
                  type = "Veteran"
                  price = "$199"
                  subscription = "year"
                  text = "Choose Veteran">
                  <List>All Member features</List>
                  <List>Exclusive workouts and challenges</List>
                  <List>Personalized coaching sessions</List>
                  <List>24/7 premium support</List>
                  <List>Early access to new features</List>
               </PricingCard>
            </div>
         </div>
      </div>
   );
}
