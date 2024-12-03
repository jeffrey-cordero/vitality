import clsx from "clsx";

interface MainProps {
  children: React.ReactNode;
  className?: string;
}

export default function Main(props: MainProps): JSX.Element {
   const { children, className } = props;

   return (
      <main className = { clsx("m-auto mb-16 sm:mb-20 mt-10 flex min-h-screen w-full flex-col items-center justify-start overflow-hidden px-2 text-center md:px-4", className) }>
         { children }
      </main>
   );
}