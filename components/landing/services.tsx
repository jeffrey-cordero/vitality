import { faBottleWater, faBrain, faBullseye, faDumbbell, faUtensils, faWeightScale, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";

import Heading from "@/components/global/heading";

interface ServiceProps {
  icon: IconDefinition;
  title: string;
  background: string;
  color: string;
}

function Service(props: ServiceProps): JSX.Element {
   const { background, color, icon, title } = props;

   return (
      <div
         className = {
            cx(
               background,
               color,
               "flex flex-col items-center justify-center gap-3 max-w-full mx-auto xsm:max-w-none size-[8rem] xsm:size-[9rem] text-center rounded-2xl shadow-md",
            )
         }
      >
         <FontAwesomeIcon
            icon = { icon }
            className = { cx(color, "text-[1.9rem] xsm:text-4xl") }
         />
         <h1 className = "text-[1.2rem] font-bold xsm:text-xl">{ title }</h1>
      </div>
   );
}

export default function Services(): JSX.Element {
   return (
      <div className = "mx-auto w-full max-w-7xl">
         <Heading
            title = "Our Services"
            message = "Driven by innovation, we continually explore new ways to elevate your wellness journey"
         />
         <div className = "container relative mx-auto my-8 grid grid-cols-1 content-center justify-center gap-x-6 gap-y-8 px-2 min-[325px]:grid-cols-2 xsm:gap-x-0 xsm:gap-y-10 xsm:px-0 md:my-12 md:gap-x-[225px] lg:gap-x-0 xl:grid-cols-3">
            <Service
               background = "bg-white dark:bg-slate-800"
               color = "text-primary"
               icon = { faDumbbell }
               title = "Workouts"
            />
            <Service
               background = "bg-primary"
               color = "text-white"
               icon = { faUtensils }
               title = "Nutrition"
            />
            <Service
               background = "bg-white dark:bg-slate-800 min-[325px]:row-start-2 min-[325px]:col-start-2 xl:row-start-1 xl:col-start-3"
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