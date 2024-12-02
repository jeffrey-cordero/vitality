interface HeadingProps {
  title: string;
  description: string;
}

export default function Heading(props: HeadingProps): JSX.Element {
   const { title, description } = props;

   return (
      <div className = "relative max-w-[40rem] text-center mx-auto mb-2 px-2 sm:px-4 lg:px-6 overflow-hidden">
         <h1 className = "mt-4 mx-auto font-semibold text-primary text-4xl sm:text-5xl">
            { title }
         </h1>
         <p className = "mt-3 mx-auto px-3 sm:px-8 text-md sm:text-lg text-gray-500 dark:text-gray-400">
            { description }
         </p>
      </div>
   );
}