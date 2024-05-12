interface HeadingProps {
   title: string;
   description?: string;
}

export default function Heading (props: HeadingProps): JSX.Element {
   return (
      <div className = "w-full mx-auto my-12">
         <h1
            className = "text-primary text-4xl w-full sm:w-3/5 font-bold mx-auto"
         >
            {props.title}
         </h1>
         {
            props.description &&
            <p className = "text-lg font-medium text-slate-500 w-4/5 mx-auto mt-8">
               {props.description}
            </p>
         }
      </div>
   );
}