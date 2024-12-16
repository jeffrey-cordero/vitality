import clsx from "clsx";

interface MainProps {
  children: React.ReactNode;
  className?: string;
}

export default function Main(props: MainProps): JSX.Element {
   const { children, className } = props;

   return (
      <main className = { clsx("m-auto mt-10 flex w-full grow flex-col items-center justify-start overflow-hidden px-3 text-center md:px-4", className) }>
         { children }
      </main>
   );
}