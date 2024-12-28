import { avatarImagesRegex, base64ImageRegex, urlRegex, workoutImagesRegex } from "@/lib/global/regex";
import { Exercise } from "@/lib/home/workouts/exercises";
import { Workout } from "@/lib/home/workouts/workouts";

export function verifyImageURL(url: string): boolean {
   return url.trim().length === 0 || urlRegex.test(url) || workoutImagesRegex.test(url) || avatarImagesRegex.test(url) || base64ImageRegex.test(url);
}

export function formatDatabaseWorkout(workout: any): Workout {
   return workout !== null ? {
      id: workout.id,
      user_id: workout.user_id,
      title: workout.title,
      date: new Date(workout.date),
      description: workout.description ?? "",
      image: workout.image ?? "",
      tagIds: workout.workout_applied_tags?.map(
         (applied: any) => applied.tag_id,
      ) ?? [],
      exercises: workout.exercises?.map(
         (exercise: any) => formatDatabaseExercise(exercise)
      ) ?? []
   } : null;
}

export function formatDatabaseExercise(exercise: any): Exercise {
   return exercise !== null ? {
      id: exercise.id,
      workout_id: exercise.workout_id,
      name: exercise.name,
      exercise_order: exercise.exercise_order,
      entries: exercise.exercise_entries ?? []
   } : null;
}