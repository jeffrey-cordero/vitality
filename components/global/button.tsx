import clsx from "clsx";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: IconProp;
}

export default function Button(props: ButtonProps): JSX.Element {
   const { children, className, icon } = props;

   return (
      <button
         { ...props }
         className = {
            clsx(
               "flex gap-2 items-center justify-center focus:ring-slate-200 font-bold rounded-lg text-md outline-none hover:cursor-pointer",
               className,
            )
         }>
         {
            icon && (
               <FontAwesomeIcon icon = { icon } />
            )
         }
         { children }
      </button>
   );
}