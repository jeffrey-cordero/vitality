interface MainProps {
  children: React.ReactNode;
}

export default function Main(props: MainProps): JSX.Element {
   const { children } = props;

   return (
      <main className = "m-auto mb-20 mt-10 flex min-h-screen w-full flex-col items-center justify-start overflow-hidden px-2 text-center md:px-4">
         { children }
      </main>
   );
}