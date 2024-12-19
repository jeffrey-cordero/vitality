import { Workout } from "@/lib/home/workouts/workouts";
import { urlRegex, workoutsImageRegex, base64ImageRegex } from "@/lib/home/workouts/regex";

export function verifyImageURL(url: string): boolean {
   return url.trim().length === 0 || urlRegex.test(url) || workoutsImageRegex.test(url) || base64ImageRegex.test(url);
}

export function formateDatabaseWorkout(workout: any): Workout {
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