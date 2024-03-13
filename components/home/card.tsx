import cx from "classnames";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export default function Card({ icon, title, description }: { icon: IconProp, title: string, description: string }): JSX.Element {
  return (
    <div className="w-72 h-96 text-center rounded-xl border border-gray-200 bg-white shadow-md " >
      <div className="flex flex-col text-center justify-center align-start gap-6 pt-20 px-7 text-black">
        <FontAwesomeIcon icon={icon} className="text-3xl text-blue-700" />
        <h1 className="font-medium text-2xl text-blue-700">{title}</h1>
        <p className="font-light text-slate-400">{description}</p>
      </div>

    </div>

  );
}