import cx from "classnames";
import Heading from "@/components/global/heading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faPersonRunning, faUtensils, faBullseye, faWeightScale, faBottleWater, faBrain } from "@fortawesome/free-solid-svg-icons";

interface ServiceProps {
  icon: IconProp;
  title: string;
  background: string;
  color: string;
}

function Service(props: ServiceProps): JSX.Element {
   const { icon, title, background, color } = props;
   return (
      <div
         className = {cx(
            background,
            color,
            "flex flex-col align-center justify-center gap-2 max-w-[90%] w-[11rem] xsm:w-[10rem] h-[11rem] xsm:h-[10rem] text-center rounded-2xl border border-gray-200 shadow-md mx-auto hover:scale-[1.05] transition duration-300 ease-in-out",
         )}>
         <FontAwesomeIcon
            icon = {icon}
            className = {cx(color, "text-4xl")}
         />
         <h1 className = "font-bold text-xl">{title}</h1>
      </div>
   );
}

export default function Services(): JSX.Element {
   return (
      <div className = "w-full lg:w-8/12 mx-auto">
         <Heading
            title = "Our Services"
            description = "Driven by innovation, we continually explore new ways to elevate your wellness journey"
         />
         <div className = "relative grid grid-cols-1 xsm:grid-cols-2 lg:grid-cols-3 gap-y-[20px] xsm:gap-y-[40px] justify-center content-center container mx-auto py-6">
            <Service
               background = "bg-white"
               color = "text-primary"
               icon = {faPersonRunning}
               title = "Workouts"
            />
            <Service
               background = "bg-primary"
               color = "text-white"
               icon = {faUtensils}
               title = "Nutrition"
            />
            <Service
               background = "bg-white"
               color = "text-primary"
               icon = {faWeightScale}
               title = "Weight"
            />
            <Service
               background = "bg-primary"
               color = "text-white"
               icon = {faBottleWater}
               title = "Hydration"
            />
            <Service
               background = "bg-white"
               color = "text-primary"
               icon = {faBullseye}
               title = "Goals"
            />
            <Service
               background = "bg-primary"
               color = "text-white"
               icon = {faBrain}
               title = "Mood"
            />
         </div>
      </div>
   );
}
