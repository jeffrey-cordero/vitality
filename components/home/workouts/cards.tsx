import { VitalityAction, VitalityState } from "@/lib/global/state";
import { Tag, Workout } from "@/lib/workouts/workouts";
import clsx from "clsx";
import { Dispatch, useMemo } from "react";
import WorkoutForm from "./form";

interface WorkoutCardProps extends WorkoutCardsProps {
   workout: Workout;
}

function WorkoutCard(props: WorkoutCardProps): JSX.Element {
   const { workout, state } = props;

   const workoutTags = useMemo(() => {
      return workout.tagIds.map((tagId: string) => {
         // Fetch tag using id
         const tag: Tag = state.inputs.tags.data.dictionary[tagId];

         return (
            // Undefined in case of removal
            tag !== undefined &&
            <div
               className={clsx("px-3 py-1 m-2 rounded-2xl text-sm font-bold text-white transition duration-300 ease-in-out")}
               style={{
                  backgroundColor: tag.color
               }}
               key={tag.id}
            >
               {tag.title}
            </div>
         );
      });
   }, [workout, state.inputs.tags.data.dictionary]);

   return (
      <WorkoutForm
         {...props}
         cover={
            <div className="cursor-pointer w-[20rem] rounded overflow-hidden shadow-lg bg-white hover:scale-105 transition duration-300 ease-in-out">
               <img className="w-full h-48 object-cover" src={workout.image} alt={workout.title} />
               <div className="flex flex-col flex-wrap justify-center items-center gap-2 p-4">
                  <h2 className="font-bold text-xl mb-2">{workout.title}</h2>
                  <p className="text-gray-600 text-sm">{new Date(workout.date).toLocaleDateString()}</p>
                  <div className="flex flex-row flex-wrap justify-center items-center gap-0 max-w-[10rem]">
                     {workoutTags}
                  </div>
               </div>
            </div>
         }
      />
   );
};

interface WorkoutCardsProps {
   state: VitalityState;
   dispatch: Dispatch<VitalityAction<Workout>>;
   reset: () => void;
}

export default function WorkoutCards(props: WorkoutCardsProps): JSX.Element {
   const { state } = props;
   const workouts: Workout[] = state.inputs.workouts.value;

   return (
      <div className="flex flex-wrap justify-center space-x-4">
         {workouts.map((workout: Workout) => (
            <WorkoutCard {...props} workout={workout} key={workout.id} />
         ))}
      </div>
   )
}