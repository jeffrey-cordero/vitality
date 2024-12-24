import { faCodeCompare, faHeartCircleBolt, faPaintBrush, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Heading from "@/components/global/heading";
import Cards from "@/components/landing/cards";

interface HighLightProps {
  icon: IconDefinition;
  title: string;
  message: string;
  className?: string;
}

function Highlight(props: HighLightProps): JSX.Element {
   const { icon, title, message } = props;

   return (
      <div className = "mx-auto flex w-full flex-col items-center justify-center gap-6 px-4 py-10 text-center text-black xxsm:py-0">
         <div className = "relative">
            <FontAwesomeIcon
               icon = { icon }
               className = "text-[2.5rem] text-primary xxsm:text-[2.9rem]"
            />
         </div>
         <div className = "relative">
            <h1 className = "mb-3 whitespace-nowrap text-[1.2rem] font-bold text-primary xxsm:text-[1.4rem] xsm:text-2xl">
               { title }
            </h1>
            <p className = "max-w-80 px-4 text-sm/6 font-medium text-gray-500 xsm:px-6 xsm:text-[0.95rem]/6 dark:text-gray-400">
               { message }
            </p>
         </div>
      </div>
   );
}

export default function Highlights(): JSX.Element {
   return (
      <div className = "mx-auto w-full">
         <Heading
            title = "Optimized Fitness Tracking"
            message = "Our cutting-edge fitness tracker empowers you to effortlessly track progress, set goals, and reach peak fitness"
         />
         <Cards
            className = "min-h-80 md:min-h-[21rem] xl:min-h-[23rem]"
         >
            {
               [
                  <Highlight
                     icon = { faPaintBrush }
                     title = "Modern Design"
                     message = "Crafted with precision, highlighting bold visuals and well-spaced components."
                     className = "w-[30rem] md:w-80"
                     key = "highlight-one"
                  />,
                  <Highlight
                     icon = { faCodeCompare }
                     title = "Efficiency"
                     message = "Achieve your goals with ease using data-driven insights and powerful analytic tools."
                     className = "w-[30rem] md:w-80"
                     key = "highlight-two"
                  />,
                  <Highlight
                     icon = { faHeartCircleBolt }
                     title = "Diversity"
                     message = "Explore a diverse range of fitness trackers designed for every lifestyle and goal."
                     className = "w-[30rem] md:w-[42rem] xl:w-80"
                     key = "highlight-three"
                  />
               ]
            }
         </Cards>
      </div>
   );
}