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
         className = {
            cx(
               background,
               color,
               "flex flex-col align-center justify-center gap-2 w-[22rem] max-w-[90%] xsm:max-w-none mx-auto xsm:w-[10rem] h-[11rem] xsm:h-[10rem] text-center rounded-2xl shadow-md",
            )
         }>
         <FontAwesomeIcon
            icon = { icon }
            className = { cx(color, "text-5xl xsm:text-4xl") }
         />
         <h1 className = "font-bold text-2xl xsm:text-xl">{ title }</h1>
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
         <div className = "relative grid grid-cols-1 xsm:grid-cols-2 lg:grid-cols-3 gap-y-[20px] xsm:gap-y-[40px] justify-center content-center container mx-auto my-8">
            <Service
               background = "bg-white dark:bg-slate-800"
               color = "text-primary"
               icon = { faPersonRunning }
               title = "Workouts"
            />
            <Service
               background = "bg-primary"
               color = "text-white"
               icon = { faUtensils }
               title = "Nutrition"
            />
            <Service
               background = "bg-white dark:bg-slate-800"
               color = "text-primary"
               icon = { faWeightScale }
               title = "Weight"
            />
            <Service
               background = "bg-primary"
               color = "text-white"
               icon = { faBottleWater }
               title = "Hydration"
            />
            <Service
               background = "bg-white dark:bg-slate-800"
               color = "text-primary"
               icon = { faBullseye }
               title = "Goals"
            />
            <Service
               background = "bg-primary"
               color = "text-white"
               icon = { faBrain }
               title = "Mood"
            />
         </div>
      </div>
   );
}