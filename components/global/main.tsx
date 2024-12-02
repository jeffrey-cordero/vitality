interface MainProps {
  children: React.ReactNode;
}

export default function Main(props: MainProps): JSX.Element {
   const { children } = props;

   return (
      <main className = "w-full min-h-screen m-auto flex flex-col items-center justify-start px-2 md:px-4 text-center overflow-hidden mt-10 mb-20">
         { children }
      </main>
   );
}