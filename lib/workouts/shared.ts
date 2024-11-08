import { Workout } from "@/lib/workouts/workouts";
import { Exercise } from "@/lib/workouts/exercises";

const urlRegex =
  /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|svg)|https?:\/\/[^/]+\/[^?#]+\?.*)$/i;
const nextMediaRegex =
  /^\/workouts\/(bike|cardio|default|hike|legs|lift|machine|run|swim|weights)\.png$/;

export function verifyURL(url: string): boolean {
   return urlRegex.test(url) || nextMediaRegex.test(url);
}

export function searchForTitle(array: any[], search: string): any[] {
   // Handle no input for array search
   if (search === "") {
      return array;
   }

   // Partial match search (case-insensitive - assumes search is lowercase)
   return array.filter((t) => t.title.toLowerCase().includes(search));
}

export function getWorkoutDate(date: Date): string {
   // Format: YYYY-MM-DD
   return date.toISOString().slice(0, 10);
}

export function formatWorkout(workout): Workout {
   // Turn combined tag and exercise data into a uniform Workout typed
   return {
      id: workout.id,
      user_id: workout.user_id,
      title: workout.title,
      date: workout.date,
      description: workout.description ?? "",
      image: workout.image ?? "",
      tagIds:
      workout.workout_applied_tags?.map(
         (applied_tag: any) => applied_tag.workout_tags.id,
      ) ?? [],
      exercises:
      workout.exercises?.map((exercise) => formatExercise(exercise)) ?? []
   };
}

export function formatExercise(exercise): Exercise {
   return {
      id: exercise.id,
      workout_id: exercise.workout_id,
      exercise_order: exercise.exercise_order,
      name: exercise.name,
      sets: exercise.sets ?? []
   };
}
