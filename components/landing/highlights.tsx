import Heading from "@/components/global/heading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faHeartCircleBolt, faCodeCompare, faPalette } from "@fortawesome/free-solid-svg-icons";

interface CardProps {
  icon: IconProp;
  title: string;
  description: string;
}

function Card(props: CardProps): JSX.Element {
   const { icon, title, description } = props;

   return (
      <div className = "flex justify-center items-center w-[22rem] md:w-[18rem] h-[22rem] mx-2 xsm:mx-0 text-center rounded-2xl bg-white shadow-md dark:bg-slate-800 ">
         <div className = "w-full mx-auto flex flex-col text-center justify-center items-center gap-4 px-6 text-black">
            <div>
               <FontAwesomeIcon
                  icon = { icon }
                  className = "text-5xl text-primary"
               />
               <h1 className = "font-bold text-2xl text-primary mt-8 whitespace-nowrap">
                  { title }
               </h1>
            </div>
            <div>
               <p className = "text-md font-medium text-gray-500 dark:text-gray-400 px-1">
                  { description }
               </p>
            </div>
         </div>
      </div>
   );
}

export default function Highlights(): JSX.Element {
   return (
      <div className = "w-full mx-auto">
         <Heading
            title = "Optimized Fitness Tracking"
            description = "Our cutting-edge fitness tracker empowers you to effortlessly track progress, set goals, and reach peak fitness"
         />
         <div className = "relative container mx-auto flex flex-row flex-wrap justify-center align-center gap-8 p-2 my-8">
            <Card
               icon = { faPalette }
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