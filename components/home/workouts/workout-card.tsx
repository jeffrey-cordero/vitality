import { Tag, Workout } from "@/lib/workouts/workouts";

export default function WorkoutCard(props: Workout) {
   return (
      <div className="w-[10rem] h-[10rem] bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
         <img src={props.image} alt={props.title} className="w-full h-48 object-cover" />
         <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">{props.title}</h2>
            <p className="text-gray-600 mb-2">
               {new Date(props.date).toLocaleDateString()}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
               {props.tags.map((tag: Tag) => (
                  <span
                     key={tag.id}
                     className="px-2 py-1 text-xs font-semibold text-white rounded"
                     style={{ backgroundColor: tag.color }}
                  >
                     {tag.title}
                  </span>
               ))}
            </div>
         </div>
      </div>
   );
}