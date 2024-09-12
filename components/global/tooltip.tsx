import { useState } from "react";

interface ToolTipProps extends React.HTMLAttributes<HTMLDivElement> {
   children?: React.ReactNode;
   tooltipContent: React.ReactNode;
}

export default function ToolTip(props: ToolTipProps): JSX.Element {
   const [showTooltip, setShowTooltip] = useState(false);

   return (
      <div
         className = "relative"
         onMouseEnter = {() => setShowTooltip(true)}
         onMouseDown = {() => setShowTooltip(false)}
         onMouseLeave = {() => setShowTooltip(false)}
      >
         {props.children}
         {
            showTooltip && (
               <div className = "absolute left-1/2 transform -translate-x-1/2 bottom-full mb-3 rounded-2xl shadow-xl z-30 transition duration-300 ease-in-out">
                  {props.tooltipContent}
               </div>
            )
         }
      </div>
   );
};