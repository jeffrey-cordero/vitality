interface HeadingProps {
  title: string;
  description: string;
}

export default function Heading(props: HeadingProps): JSX.Element {
   const { title, description } = props;

   return (
      <div className = "relative mx-auto mb-2 max-w-[40rem] overflow-hidden px-2 text-center sm:px-4 lg:px-6">
         <h1 className = "mx-auto mt-4 text-4xl font-semibold text-primary sm:text-5xl">
            { title }
         </h1>
         <p className = "mx-auto mt-3 px-3 text-base text-gray-500 sm:px-8 sm:text-lg dark:text-gray-400">
            { description }
         </p>
      </div>
   );
}