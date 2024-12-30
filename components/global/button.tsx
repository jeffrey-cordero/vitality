import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faHourglassHalf, faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onSubmit?: () => Promise<void>;
  onConfirmation?: () => Promise<void>;
  icon?: IconDefinition;
  iconStyling?: string
  isSingleSubmission?: boolean;
  inputIds?: string[];
}

const Button = forwardRef(function Button(props: ButtonProps, ref) {
   const { children, className, icon, iconStyling, onClick, onSubmit, onConfirmation, onBlur, isSingleSubmission, inputIds, ...rest } = props;
   const [displaySubmitted, setDisplaySubmitted] = useState<boolean>(false);
   const [displayConfirmed, setDisplayConfirmed] = useState<boolean>(false);
   const savedIconRef = useRef<SVGSVGElement>(null);
   const submitTimeOut = useRef<NodeJS.Timeout>(null);
   const revertTimeOut = useRef<NodeJS.Timeout>(null);
   const confirmTimeOut = useRef<NodeJS.Timeout>(null);
   const buttonRef = useRef(null);

   const invokeSubmission = useCallback(async() => {
      // Cancel any pending response submission timeout for single submission buttons
      if (isSingleSubmission) {
         clearTimeout(submitTimeOut.current);
         clearTimeout(revertTimeOut.current);
      }

      // Display the submit icon with a bouncing animation temporarily
      setDisplaySubmitted(true);

      inputIds?.forEach(
         // Disable the form inputs
         (id: string) => (document.getElementById(id) as HTMLFormElement | HTMLDivElement)?.setAttribute("disabled", "true")
      );

      submitTimeOut.current = setTimeout(async() => {
         // Cancel any pending update icon removal timeout and submit response
         clearTimeout(revertTimeOut.current);

         await onSubmit();

         revertTimeOut.current = setTimeout(() => {
            inputIds?.forEach(
               // Enable the form inputs
               (id: string) => (document.getElementById(id) as HTMLFormElement | HTMLDivElement)?.removeAttribute("disabled")
            );

            setDisplaySubmitted(false);
            onBlur?.call(null);
         });
      }, 250);
   }, [
      onBlur,
      onSubmit,
      inputIds,
      isSingleSubmission
   ]);

   const invokeConfirmation = useCallback(async() => {
      // Cancel any pending response submission timeout
      clearTimeout(confirmTimeOut.current);

      // Display the confirm icon with a wiggle animation temporarily
      setDisplayConfirmed(true);

      confirmTimeOut.current = setTimeout(async() => {
         await onConfirmation();
         setDisplayConfirmed(false);
         onBlur?.call(null);
      }, 1000);
   }, [
      onBlur,
      onConfirmation
   ]);

   const onClickHandler = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      // Always call the defined onClick method and blur the element
      onClick?.call(this, event);
      buttonRef.current?.blur();
   }, [onClick]);

   useImperativeHandle(ref, () => ({
      submit: invokeSubmission,
      confirm: invokeConfirmation
   }));

   return (
      <button
         { ...rest }
         ref = { buttonRef }
         className = {
            clsx(
               "flex items-center justify-center gap-2 rounded-lg text-[0.9rem] font-bold outline-none hover:cursor-pointer focus:border-blue-600 focus:ring-2 focus:ring-blue-600 xxsm:text-base",
               className
            )
         }
         onClick = { onClickHandler }
      >
         {
            icon && (
               <FontAwesomeIcon
                  ref = { savedIconRef }
                  className = {
                     clsx(iconStyling, {
                        "animate-wiggle": displaySubmitted || displayConfirmed
                     })
                  }
                  icon = { displaySubmitted ? faHourglassHalf : displayConfirmed ? faSquareCheck : icon }
               />
            )
         }
         { children }
      </button>
   );
});

export default Button;