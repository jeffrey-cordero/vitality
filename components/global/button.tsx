import clsx from "clsx";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: IconProp;
  styling?: string
}

const Button = forwardRef(function Button(props: ButtonProps, ref) {
   const { children, className, icon, styling, onClick, onBlur } = props;
   const [displaySaved, setDisplaySaved] = useState<boolean>(false);
   const [displayRemoval, setDisplayRemoval] = useState<boolean>(false);
   const savedIconRef = useRef<SVGSVGElement>(null);
   const buttonRef = useRef(null);
   const revertInterval = useRef<NodeJS.Timeout>(null);

   const handleDisplaySave = useCallback(() => {
      // Display the save icon with a bouncing animation temporarily
      setDisplaySaved(true);
      clearTimeout(revertInterval.current);

      revertInterval.current = setTimeout(() => {
         setDisplaySaved(false);
         onBlur?.call(null);
      }, 2500);

   }, [onBlur]);

   const handleDisplayRemoval = useCallback(() => {
      setDisplayRemoval(true);

      setTimeout(() => {
         setDisplayRemoval(false);
      }, 2000);
   }, [])

   useImperativeHandle(ref, () => ({
      displaySave: handleDisplaySave,
      displayRemoval: handleDisplayRemoval
   }));

   return (
      <button
         { ...props }
         ref = { buttonRef }
         className = {
            clsx(
               "flex items-center justify-center gap-2 rounded-lg text-[0.9rem] font-bold outline-none hover:cursor-pointer focus:border-blue-600 focus:ring-2 focus:ring-blue-600 xxsm:text-base",
               className
            )
         }
         onClick = {
            (event: React.MouseEvent<HTMLButtonElement>) => {
               // Always call the defined onClick method and blur the button element
               onClick?.call(this, event);
               buttonRef.current?.blur();
            }
         }
      >
         {
            icon && (
               <FontAwesomeIcon
                  ref = { savedIconRef }
                  className = {
                     clsx(styling, {
                        "animate-bounce": displaySaved,
                        "animate-wiggle": displayRemoval
                     })
                  }
                  icon = { displaySaved ? faFloppyDisk : icon }
               />
            )
         }
         { children }
      </button>
   );
});

export default Button;