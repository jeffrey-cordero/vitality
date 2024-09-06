import clsx from "clsx";
import { InputProps } from "@/components/global/input";
import { Tag } from "@/lib/workouts/workouts";

function searchForTag(tags: Tag[], search: string): Tag[] {
   // Handle no input for tag search
   if (search === "") {
      return tags;
   }

   // Convert search string to lower case for case-insensitive comparison
   const searchLower = search.toLowerCase();

   // Simple search for tag based on starting with specific pattern
   return tags.filter(tag => tag.title.toLowerCase().startsWith(searchLower));
}

function NewTagForm(search: string) {
   
   return (
      <div
         className="cursor-pointer transition duration-300 ease-in-out hover:bg-gray-300 p-2 rounded-2xl"
         onClick={() => alert("Will add this tag")}
      >
         <h1>Add <span className="inline-block px-3 py-1 rounded-full text-sm font-bold text-black bg-gray-100">{search}</span> to workout tags</h1>
      </div>
      
   )
}

function TagsItem(props: InputProps, tag: Tag, index: number): JSX.Element {
   return (
      <div 
         className={clsx("cursor-pointer inline-block px-3 py-1 rounded-full text-sm font-bold text-black")}
         style={{
            backgroundColor: tag.color,
         }}
         key={index}
         >
         { tag.title }
      </div>
   );
};

export default function TagSelection(props: InputProps): JSX.Element {
   const search: string = props.data?.search;
   const isValidSearch = search.trim().length > 0;
   const options = props.input.data?.options;
   const results: Tag[] = searchForTag(options, search);

   return (
      <div>
         <div id="search-results">
            <ul className="text-sm m-2 text-gray-700" aria-labelledby="dropdownSearchButton">
               {
                  results.length > 0 ? results.map((option: Tag, index: number) => {
                     return TagsItem(props, option, index);
                  }) : isValidSearch && NewTagForm(search)
               }
            </ul>
         </div>
      </div>
   )
}