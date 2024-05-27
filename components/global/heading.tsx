interface HeadingProps {
   title: string;
   description?: string;
}

export default function Heading (props: HeadingProps): JSX.Element {
   return (
      <div className = "w-full mx-auto my-6">
         <h1
            className = "text-primary text-5xl w-full md:w-3/4 xl:w-1/2 font-bold mx-auto px-2"
         >
            {props.title}
         </h1>
         {
            props.description &&
            <p className = "text-md md:text-lg font-medium text-slate-500 w-10/12 sm:w-7/12 mx-auto mt-8">
               {props.description}
            </p>
         }
      </div>
   );
}