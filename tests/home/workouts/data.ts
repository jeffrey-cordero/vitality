import { Tag } from "@/lib/home/workouts/tags";
import { Workout } from "@/lib/home/workouts/workouts";
import { root } from "@/tests/authentication/data";

export const workout: Workout = {
   id: "69b62ca8-9222-4d68-b83a-c352c3989a48",
   user_id: root.id,
   title: "Workout #1",
   date: new Date("2024-11-13T00:00:00.000Z"),
   description: "A great workout on 11/13/2024",
   image: "/workouts/hike.png",
   tagIds: [
      "00a78cd1-1969-4403-8a83-444895e76956",
      "bb3fcb1b-d4fc-42ba-b885-e507ed027f3b",
      "e331c38b-68c9-4b15-aa11-b2922026abb5"
   ],
   exercises: [
      {
         id: "33b33227-56b1-4f10-844a-660b523e546e",
         workout_id: "69b62ca8-9222-4d68-b83a-c352c3989a48",
         exercise_order: 0,
         name: "Exercise 1",
         entries: [
            {
               id: "33b33227-56b1-4f10-844a-660b523e546f",
               exercise_id: "33b33227-56b1-4f10-844a-660b523e546e",
               entry_order: 0,
               weight: 225,
               repetitions: 10,
               text: "Text"
            },
            {
               id: "33b33227-56b1-4f10-844a-660b523e546c",
               exercise_id: "33b33227-56b1-4f10-844a-660b523e546e",
               entry_order: 1,
               weight: 230,
               repetitions: 5,
               hours: 1,
               minutes: 50,
               seconds: 30,
               text: "Text"
            },
            {
               id: "33b33227-56b1-4f10-844a-660b523e546h",
               exercise_id: "33b33227-56b1-4f10-844a-660b523e546e",
               entry_order: 2,
               weight: 300,
               repetitions: 10,
               text: "Text"
            }
         ]
      },
      {
         id: "dd29ecb7-a142-4f15-b828-6379cf4a8813",
         workout_id: "69b62ca8-9222-4d68-b83a-c352c3989a48",
         exercise_order: 1,
         name: "Exercise 2",
         entries: []
      },
      {
         id: "dd29ecb7-a142-4f15-b828-6379cf4a8823",
         workout_id: "69b62ca8-9222-4d68-b83a-c352c2989a48",
         exercise_order: 2,
         name: "Exercise 3",
         entries: []
      }
   ]
};

export const tags: Tag[] = [
   {
      user_id: root.id,
      id: workout.tagIds[0],
      title: "Strength",
      color: "rgb(55, 55, 55)"
   },
   {
      user_id: root.id,
      id: workout.tagIds[1],
      title: "Running",
      color: "rgb(73, 47, 100)"
   },
   {
      user_id: root.id,
      id: workout.tagIds[2],
      title: "Swimming",
      color: "rgb(133, 76, 29)"
   }
];

export const workouts = [
   {
      ...workout,
      workout_applied_tags: [
         {
            workout_id: workout.id,
            tag_id: tags[0].id
         },
         {
            workout_id: workout.id,
            tag_id: tags[1].id
         },
         {
            workout_id: workout.id,
            tag_id: tags[2].id
         }
      ]
   },
   {
      id: "dd29ecb7-a142-4f15-b828-6379cf4a8815",
      user_id: root.id,
      title: "Workout #2",
      date: new Date("2024-11-10T00:00:00.000Z"),
      description: "A great workout on 11/10/2024",
      image: "/workouts/weights.png",
      workout_applied_tags: [
         {
            workout_id: "dd29ecb7-a142-4f15-b828-6379cf4a8815",
            tag_id: tags[0].id
         },
         {
            workout_id: "dd29ecb7-a142-4f15-b828-6379cf4a8815",
            tag_id: tags[1].id
         }
      ],
      tagIds: [tags[0].id, tags[1].id],
      exercises: []
   },
   {
      id: "dd29ecb7-a142-4f15-b828-6379cf4a8816",
      user_id: root.id,
      title: "Workout #3",
      date: new Date("2024-11-08T00:00:00.000Z"),
      description: undefined,
      image: undefined,
      workout_applied_tags: undefined,
      tagIds: undefined,
      exercises: []
   }
];