import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button ({ children, className, type, ...rest }: ButtonProps): JSX.Element {
   return (
      <button
         type = {type ?? "button"}
         {...rest}
         className = {clsx(
            "min-h-[3rem] min-w-[7rem] focus:shadow-2xl focus:ring-slate-200 font-extrabold rounded-lg text-md text-base p-1 outline-none hover:cursor-pointer hover:scale-[1.02] transition duration-300 ease-in-out",
            className,
         )}
      >
         {children}
      </button>
   );
}
