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
   divider: string;
}

function Service(props: ServiceProps): JSX.Element {
   return (
      <div className = {cx(props.background, props.color, "flex flex-col align-center justify-center gap-5 w-[14rem] max-w-[90%] md:max-w-none h-[14rem] text-center rounded-2xl hover:scale-[1.05] transition duration-300 ease-in-out border border-gray-200 shadow-md p-1 mx-auto")}>
         <FontAwesomeIcon icon = {props.icon} className = {cx(props.color, "text-4xl")} />
         <div className = {cx(props.divider, "w-1/2 mx-auto my-1")} />
         <h1 className = "font-semibold text-3xl">{props.title}</h1>
      </div>
   );
}

export default function Services(): JSX.Element {
   return (
      <div className = "w-full mx-auto my-4">
         <Heading
            title = "Our Services"
            description = "With a commitment to innovation, we're constantly exploring new avenues to enhance your wellness experience"
         />
         <div className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 justify-center content-center gap-x-[60px] gap-y-[60px] md:gap-y-[60px] w-full sm:w-11/12 mx-auto">
            <Service
               background = "bg-white"
               color = "text-primary"
               icon = {faPersonRunning}
               title = "Workouts"
               divider = "bg-primary"
            />
            <Service
               background = "bg-primary"
               color = "text-white"
               icon = {faUtensils}
               title = "Nutrition"
               divider = "bg-white"
            />
            <Service
               background = "bg-white"
               color = "text-primary"
               icon = {faWeightScale}
               title = "Weight"
               divider = "bg-primary"
            />
            <Service
               background = "bg-primary"
               color = "text-white"
               icon = {faBottleWater}
               title = "Hydration"
               divider = "bg-white"
            />
            <Service
               background = "bg-white"
               color = "text-primary"
               icon = {faBullseye}
               title = "Goals"
               divider = "bg-primary"
            />
            <Service
               background = "bg-primary"
               color = "text-white"
               icon = {faBrain}
               title = "Mood"
               divider = "bg-white"
            />
         </div>
      </div>
   );
}