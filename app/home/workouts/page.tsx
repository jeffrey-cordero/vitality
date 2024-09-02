"use client";
import PopUp from "@/components/global/popup";
import WorkoutForm from "@/components/home/workouts/workout-form";

export default function Page() {
   return (
      <main className = "w-full mx-auto flex gap-2 min-h-screen flex-col items-center justify-start text-center">
         <div>
            <h1 className = "text-4xl font-bold mt-8">Welcome Back, Champion!</h1>
            <p className = "text-lg text-gray-700 mt-4">Ready to crush your goals? Create a new workout and let&apos;s make today count!</p>
         </div>
         <div>
            <PopUp text = "New Workout">
               <WorkoutForm />
            </PopUp>
         </div>
      </main >
   );
}