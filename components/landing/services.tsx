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
               "flex flex-col items-center justify-center gap-3 w-[24rem] max-w-full mx-auto xsm:max-w-none xsm:w-[10rem] h-[11rem] xsm:h-[10rem] text-center rounded-2xl shadow-md",
            )
         }
      >
         <FontAwesomeIcon
            icon = { icon }
            className = { cx(color, "text-[2.7rem] xsm:text-4xl") }
         />
         <h1 className = "text-[1.5rem] font-bold xsm:text-xl">{ title }</h1>
      </div>
   );
}

export default function Services(): JSX.Element {
   return (
      <div className = "mx-auto w-full max-w-7xl">
         <Heading
            title = "Our Services"
            description = "Driven by innovation, we continually explore new ways to elevate your wellness journey"
         />
         <div className = "container relative mx-auto my-8 grid grid-cols-1 content-center justify-center gap-x-0 gap-y-[20px] px-3 xsm:grid-cols-2 xsm:gap-x-[20px] xsm:gap-y-[40px] xsm:px-0 sm:gap-x-0 md:gap-x-[250px] lg:gap-x-0 xl:grid-cols-3">
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