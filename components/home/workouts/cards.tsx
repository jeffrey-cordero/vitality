import Image from "next/image";
import WorkoutForm from "./form";
import Loading from "@/components/global/loading";
import { VitalityProps } from "@/lib/global/state";
import { Workout } from "@/lib/workouts/workouts";
import { getWorkoutDate } from "@/lib/workouts/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

interface WorkoutCardProps extends WorkoutCardsProps {
   workout: Workout;
}

function WorkoutCard(props: WorkoutCardProps): JSX.Element {
   const { workout } = props;

   return (
      <WorkoutForm
         {...props}
         cover = {
            <div className = "relative cursor-pointer flex flex-col justify-center items-center gap-2 w-[18rem] max-w-screen mx-auto rounded-2xl overflow-hidden shadow-xl bg-white hover:scale-105 transition duration-300 ease-in-out">
               <div className = "w-full h-[25rem] rounded-2xl rounded-b-none shadow-md">
                  <div className = "w-full h-full mx-auto">
                     {
                        workout.image ? (
                           <Image
                              quality = {100}
                              layout = "fill"
                              objectFit = "cover"
                              sizes = "100vw"
                              src = {workout.image ?? ""}
                              alt = "workout-image"
                              className = "opacity-30"
                           />
                        ) : (
                           <div className = "absolute w-full h-full bg-white opacity-30 flex justify-center items-center">
                              <FontAwesomeIcon
                                 className = "text-7xl text-primary"
                                 icon = {faImage} />
                           </div>
                        )
                     }
                     <div className = "relative w-full h-full flex flex-col justify-start items-center overflow-hidden text-center pt-5">
                        <h2 className = "text-primary font-extrabold text-4xl sm:text-3xl px-6 py-4 overflow-clip max-w-[90%] text-ellipsis whitespace-nowrap leading-none tracking-tight">{workout.title}</h2>
                        <p className = "text-primary font-extrabold text-lg sm:text-sm">{getWorkoutDate(workout.date)}</p>
                     </div>
                  </div>
               </div>
            </div>
         }
      />
   );
};

interface WorkoutCardsProps extends VitalityProps {
   workouts: Workout[];
}

export default function WorkoutCards(props: WorkoutCardsProps): JSX.Element {
   const { workouts, globalState } = props;
   const fetched: boolean = globalState.workouts.data.fetched;

   return (
      <div className = "relative w-full mx-auto">
         {
            workouts.length > 0 ? (
               <div className = "flex flex-wrap justify-center items-center gap-6 mt-6">
                  {workouts.map((workout: Workout) => (
                     <WorkoutCard
                        {...props}
                        workout = {workout}
                        key = {workout.id} />
                  ))}
               </div>
            ) : (
               <div className = "w-screen h-[15rem] mx-auto text-center flex justify-center items-center">
                  {fetched ? <h1 className = "font-bold text-xl">No available workouts</h1> : <Loading />}
               </div>
            )
         }
      </div>
   );
}