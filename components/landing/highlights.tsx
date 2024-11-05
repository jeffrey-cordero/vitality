import Heading from "@/components/global/heading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faPaintbrush, faCode, faChartColumn } from "@fortawesome/free-solid-svg-icons";

interface CardProps {
   icon: IconProp;
   title: string;
   description: string;
}

function Card(props: CardProps): JSX.Element {
   return (
      <div className = "flex justify-center w-[20rem] h-[25rem] max-w-[90%] text-center rounded-2xl border border-gray-200 bg-white shadow-md">
         <div className = "w-full mx-auto flex flex-col text-center justify-center items-center gap-8 px-6 text-black">
            <div>
               <FontAwesomeIcon
                  icon = {props.icon}
                  className = "text-4xl text-primary" />
               <h1 className = "font-bold text-2xl md:text-3xl text-primary mt-8">{props.title}</h1>
            </div>
            <div>
               <p className = "text-sm md:text-md font-medium text-slate-500">{props.description}</p>
            </div>
         </div>
      </div>
   );
}

export default function Highlights(): JSX.Element {
   return (
      <div className = "w-full mx-auto mt-8">
         <Heading
            title = "Optimized Fitness Tracking"
            description = "We've developed a cutting-edge fitness tracker that empowers users to effortlessly monitor their progress, set goals, and achieve optimal fitness levels"
         />
         <div className = "relative w-full mx-auto flex flex-row flex-wrap justify-center align-center gap-8">
            <Card
               icon = {faPaintbrush}
               title = "Modern Design"
               description = "Carefully crafted a precise design, with harmonious typography and perfect padding around every component"
            />
            <Card
               icon = {faCode}
               title = "Efficiency"
               description = "Achieve your goals efficiently and effectively with data-driven insights and a multitude of analytic tools right at your fingertips."
            />
            <Card
               icon = {faChartColumn}
               title = "Diversity"
               description = "A diverse range of fitness trackers tailored to suit every lifestyle and fitness goal. We’ve got your fitness journey covered"
            />
         </div>
      </div>
   );
}