import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: IconProp;
}

export default function Button(props: ButtonProps): JSX.Element {
   return (
      <button
         {...props}
         className = {clsx(
            "flex gap-2 items-center justify-center min-h-[2rem] min-w-[4rem] focus:ring-slate-200 font-bold rounded-lg text-md outline-none hover:cursor-pointer",
            props.className,
         )}
      >
         {
            props.icon && (
               <FontAwesomeIcon icon = {props.icon} />
            )
         }
         {props.children}
      </button>
   );
}
