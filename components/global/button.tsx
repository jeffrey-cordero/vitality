import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

export default function Button(props: ButtonProps): JSX.Element {
   return (
      <button
         {...props}
         className = {clsx(
            "flex items-center justify-center min-h-[2rem] min-w-[4rem] focus:ring-slate-200 font-bold rounded-lg text-md outline-none hover:cursor-pointer",
            props.className,
         )}
      >
         {props.children}
      </button>
   );
}
