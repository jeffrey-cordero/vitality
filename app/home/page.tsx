"use client";
import Main from "@/components/global/main";
import Loading from "@/components/global/loading";

export default function Home(): JSX.Element {
   window.location.replace("/home/workouts");

   return (
      <Main className = "mx-auto flex min-h-screen w-full flex-col items-center justify-center text-center">
         <Loading />
      </Main>
   );
}