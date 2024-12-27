import clsx from "clsx";

interface ErrorProps {
   message: string | null;
   className?: string;
}

export default function Error(props: ErrorProps): JSX.Element {
   const { message, className } = props;

   return (
      message !== null && (
         <div className = {clsx("mx-auto mb-1 mt-3 flex max-w-[90%] animate-fadeIn items-center justify-center gap-2 text-center opacity-0 text-sm xxsm:text-base", className)}>
            <p className = "input-error font-bold text-red-500">
               { message.trim() }
            </p>
         </div>
      )
   );
}