import clsx from "clsx";

interface MainProps {
   className?: string;
   children: React.ReactNode;
}

export default function Main(props: MainProps): JSX.Element {
   const { className, children } = props;

   return (
      <main className = { clsx("m-auto mt-12 flex w-full grow flex-col items-center justify-start overflow-hidden px-3 text-center md:px-4", className) }>
         { children }
      </main>
   );
}