import { Workout } from "@/lib/home/workouts/workouts";

const urlRegex =
  /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|svg)|https?:\/\/[^/]+\/[^?#]+\?.*)$/i;
const defaultImageRegex =
  /^\/workouts\/(bike|cardio|default|hike|legs|lift|machine|run|swim|weights)\.png$/;

export function verifyImageURL(url: string): boolean {
   return url.trim().length === 0 || urlRegex.test(url) || defaultImageRegex.test(url);
}

export function searchForTitle(array: any[], search: string): any[] {
   if (search === "") {
      return array;
   }

   // Partial match search (case-insensitive)
   return array.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
}

export function getWorkoutDate(date: Date): string {
   // Format: YYYY-MM-DD
   return date.toISOString().slice(0, 10);
}

export function formatWorkout(workout: any): Workout {
   // Uniform workout object containing all potential properties, tags, and exercises
   return {
      id: workout.id,
      user_id: workout.user_id,
      title: workout.title,
      date: new Date(workout.date),
      description: workout.description ?? "",
      image: workout.image ?? "",
      tagIds: workout.workout_applied_tags?.map(
         (applied: any) => applied.tag_id,
      ) ?? [],
      exercises: workout.exercises
   };
}