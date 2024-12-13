import Heading from "@/components/global/heading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faHeartCircleBolt, faCodeCompare, faFeatherPointed } from "@fortawesome/free-solid-svg-icons";

interface CardProps {
  icon: IconProp;
  title: string;
  description: string;
}

function Card(props: CardProps): JSX.Element {
   const { icon, title, description } = props;

   return (
      <div className = "mx-2 flex h-[25rem] w-[29rem] max-w-full items-center justify-center rounded-2xl bg-white text-center shadow-md xsm:mx-0 md:w-80 dark:bg-slate-800">
         <div className = "mx-auto flex w-full flex-col items-center justify-center gap-4 px-4 text-center text-black">
            <div>
               <FontAwesomeIcon
                  icon = { icon }
                  className = "text-[2.9rem] text-primary"
               />
               <h1 className = "mt-8 whitespace-nowrap text-[1.4rem] font-bold text-primary sm:text-2xl">
                  { title }
               </h1>
            </div>
            <div>
               <p className = "px-1 text-sm font-medium text-gray-500 sm:text-base dark:text-gray-400">
                  { description }
               </p>
            </div>
         </div>
      </div>
   );
}

export default function Highlights(): JSX.Element {
   return (
      <div className = "mx-auto w-full">
         <Heading
            title = "Optimized Fitness Tracking"
            description = "Our cutting-edge fitness tracker empowers you to effortlessly track progress, set goals, and reach peak fitness"
         />
         <div className = "container relative mx-auto my-8 flex flex-row flex-wrap items-center justify-center gap-8 xsm:p-2 xl:flex-nowrap">
            <Card
               icon = { faFeatherPointed }
               title = "Modern Design"
               description = "Designed with precision, balanced typography, and perfectly spaced components."
            />
            <Card
               icon = { faCodeCompare }
               title = "Efficiency"
               description = "Achieve your goals with ease using data-driven insights and powerful analytic tools."
            />
            <Card
               icon = { faHeartCircleBolt }
               title = "Diversity"
               description = "Explore a diverse range of fitness trackers designed for every lifestyle and goal."
            />
         </div>
      </div>
   );
}