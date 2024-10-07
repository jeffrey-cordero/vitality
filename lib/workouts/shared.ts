import { Workout } from "./workouts";

export function searchForTitle(array: any[], search: string): any[] {
   // Handle no input for array search
   if (search === "") {
      return array;
   }

   // Partial match search (case-insensitive - assumes search is lowercase)
   return array.filter(t => t.title.toLowerCase().includes(search));
}

export function getWorkoutDate(date: Date): string {
   // Format: YYYY-MM-DD
   return date.toISOString().slice(0, 10);
}

export function formatWorkout(workout): Workout {
   // Turn combined tag and exercise data into a uniform Workout type
   return {
      id: workout.id,
      user_id: workout.user_id,
      title: workout.title,
      date: workout.date,
      description: workout.description ?? "",
      image: workout.image ?? "",
      tagIds: workout.workout_applied_tags.map(
         (applied_tag: any) => applied_tag.workout_tags.id
      )
   };
}
