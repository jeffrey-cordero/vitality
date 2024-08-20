import Image from "next/image";

// TODO - put in components folder
interface CardProps  {
   title: string;
   message: string;
   image: "run" | "hike" | "legs" | "swim";
}

function Card(props : CardProps): JSX.Element {
   return (
      <div className="max-w-sm rounded-xl overflow-hidden shadow-xl bg-white">
         <div className="max-w-full h-48">
            <Image
               width={500}
               height={300}
               src={require(`@/public/workouts/${props.image}.jpg`)}
               alt="run"
               className="w-full h-full object-cover object-center shadow-inner" 
            />
         </div>
         <div className="px-6 py-4 min-h-[15rem] flex flex-col justify-start align-center p-7">
            <h2 className="font-bold text-xl mb-2 mt-8">{props.title}</h2>
            <p className="text-gray-700 text-base mt-6">
               {props.message}
            </p>
         </div>
      </div>
   );
}

export default function Page() {
   return (
      <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-start text-center">
         <div>
            <h1 className = "text-4xl font-bold mt-8">Workouts</h1>
            <p className = "text-lg text-gray-700 mt-4">Choose a workout to get started</p>
         </div>
         <div className="flex flex-row gap-8 p-12 justify-center flex-wrap">
            <Card title="Cardio" message="Improve your health and longevity;" image="run" />
            <Card title="Hike" message="Improve your health and longevity;" image="hike" />
            <Card title="Weights" message="Improve your health and longevity;" image="legs" />
            <Card title="Swimming" message="Improve your health and longevity;" image="swim" />
         </div>
      </main >
   );
}