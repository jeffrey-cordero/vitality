import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faPaintbrush } from "@fortawesome/free-solid-svg-icons";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { faChartColumn } from "@fortawesome/free-solid-svg-icons";

function Card({ icon, title, description }: { icon: IconProp, title: string, description: string }): JSX.Element {
  return (
    <div className="w-72 h-96 text-center rounded-xl border border-gray-200 bg-white shadow-md" >
      <div className="flex flex-col text-center justify-center align-start gap-6 pt-20 px-7 text-black">
        <FontAwesomeIcon icon={icon} className="text-3xl text-blue-700" />
        <h1 className="font-medium text-2xl text-blue-700">{title}</h1>
        <p className="font-light text-slate-400">{description}</p>
      </div>

    </div>

  );
}

export default function Highlights(): JSX.Element {
   return(
      <div className="flex flex-row flex-wrap gap-12 justify-center align-center my-12">
      <Card
        icon={faPaintbrush}
        title="Modern Design"
        description="Carefully crafted a precise design, with harmonious typography and perfect padding around every component"
      />
      <Card
        icon={faCode}
        title="Efficiency"
        description="Achieve your goals efficiently and effectively with data-driven insights and a multitude of analytic tools right at your fingertips."
      />
      <Card
        icon={faChartColumn}
        title="Diversity"
        description="A diverse range of fitness trackers tailored to suit every lifestyle and fitness goal. We’ve got your fitness journey covered"
      />
    </div>
   )
}