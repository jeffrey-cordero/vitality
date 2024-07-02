import Image from "next/image";

export default function Page() {
   return (
      <main className="w-full mx-auto flex min-h-screen flex-col items-center justify-start text-center">
         <h1>Workouts</h1>
         <Image
            width={500}
            height={500}
            src="../public/workouts/swim.jpg"
            alt="swim"
            className="w-full h-full shadow-sm rounded-2xl"
         />
      </main >
   );
}