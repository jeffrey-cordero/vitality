import { Exercise } from "@/lib/home/workouts/exercises";
import { Workout } from "@/lib/home/workouts/workouts";

export const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|svg))$/i;
export const workoutImagesRegex = /^\/workouts\/(bike|cardio|default|hike|legs|lift|machine|run|swim|weights)\.png$/;
export const base64ImageRegex = /^data:image\/(jpeg|png|gif|bmp|webp);base64,[A-Za-z0-9+/=]+$/;

export const emptyWorkout: Workout = {
   id: "",
   user_id: "",
   title: "",
   date: new Date(),
   image: "",
   description: "",
   tagIds: [],
   exercises: []
};

export function verifyImageURL(url: string): boolean {
   return url.trim().length === 0 || urlRegex.test(url) || workoutImagesRegex.test(url) || base64ImageRegex.test(url);
}

export function formatDatabaseWorkout(workout: any): Workout {
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
      exercises: workout.exercises?.map(
         (exercise: any) => formatDatabaseExercise(exercise)
      ) ?? []
   };
}

export function formatDatabaseExercise(exercise: any): Exercise {
   return {
      id: exercise.id,
      workout_id: exercise.workout_id,
      name: exercise.name,
      exercise_order: exercise.exercise_order,
      entries: exercise.exercise_entries
   };
}