import Heading from "@/components/global/heading";
import Button from "@/components/global/button";

interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
   children: React.ReactNode;
   description: string;
   price: string;
   type: string;
   subscription: string;
   text: string;
}

function PricingCard (props: PricingCardProps): JSX.Element {
   return (
      <>
         <div className = "w-full px-2 md:w-1/2 lg:w-1/3 hover:scale-[1.05] transition duration-300 ease-in-out">
            <div className = "relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md p-10 min-h-[38rem]">
               <span className = "mb-3 block text-2xl font-bold text-primary">
                  {props.type}
               </span>
               <h2 className = "mb-5 text-[42px] font-bold text-dark">
                  {props.price}
                  <span className = "text-base font-medium text-body-color">
                     / {props.subscription}
                  </span>
               </h2>
               <p className = "border-b-2 border-b-slate-400 border-stroke pb-6 h-[4.5rem] text-semibold text-body-color">
                  {props.description}
               </p>
               <div className = "my-8 flex flex-col justify-center gap-[14px] h-[12.5rem]">{props.children}</div>
               <Button
                  className = "block w-full rounded-md border border-primary bg-primary p-3 text-center text-white"
               >
                  {props.text}
               </Button>
            </div>
         </div>
      </>
   );
};

function List ({ children }: { children: React.ReactNode }): JSX.Element {
   return (
      <p className = "text-base text-body-color">{children}</p>
   );
};

export default function Pricing (): JSX.Element {
   return (
      <div className = "w-full mx-auto">
         <Heading
            title = "Choose Your Plan"
            description = "Select a plan that best suits your needs and goals"
         />
         <div className = "w-full mx-4 flex flex-wrap justify-center items-center gap-6">
            <div className = "flex justify-center flex-wrap">
               <PricingCard
                  type = "Regular"
                  price = "$0"
                  subscription = "year"
                  description = "Basic features to guide you on your fitness journey."
                  text = "Choose Regular"
               >
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
                  description = "Premium features and personalized guidance."
                  text = "Choose Member"
               >
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
                  description = "Get exclusive access to VIP perks and elite support."
                  text = "Choose Veteran"
               >
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
};
