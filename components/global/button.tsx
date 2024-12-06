import clsx from "clsx";
import { useRef } from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: IconProp;
  iconClassName?: string
}

export default function Button(props: ButtonProps): JSX.Element {
   const { children, className, icon, iconClassName, onClick } = props;
   const buttonRef = useRef(null);

   return (
      <button
         { ...props }
         ref = { buttonRef }
         className = {
            clsx(
               "flex items-center justify-center gap-2 rounded-lg text-base font-bold outline-none hover:cursor-pointer focus:border-blue-600 focus:ring-2 focus:ring-blue-600",
               className
            )
         }
         onClick = {
            (event) => {
               onClick?.call(this, event);
               buttonRef.current?.blur();
            }
         }
      >
         {
            icon && (
               <FontAwesomeIcon
                  className = { iconClassName }
                  icon = { icon }

               />
            )
         }
         { children }
      </button>
   );
}