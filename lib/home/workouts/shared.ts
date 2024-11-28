import { Workout } from "@/lib/home/workouts/workouts";

const urlRegex =
  /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|svg)|https?:\/\/[^/]+\/[^?#]+\?.*)$/i;
const defaultImageRegex =
  /^\/workouts\/(bike|cardio|default|hike|legs|lift|machine|run|swim|weights)\.png$/;

export function verifyImageURL(url: string): boolean {
   return url.trim().length === 0 || urlRegex.test(url) || defaultImageRegex.test(url);
}

export function formatWorkout(workout: any): Workout {
   // Uniform workout object containing all potential properties, tag ID's, and exercises
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
      exercises: workout.exercises ?? []
   };
}