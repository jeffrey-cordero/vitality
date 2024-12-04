interface HeadingProps {
  title: string;
  description: string;
}

export default function Heading(props: HeadingProps): JSX.Element {
   const { title, description } = props;

   return (
      <div className = "relative mx-auto mb-2 overflow-hidden px-2 text-center sm:px-4 lg:px-6">
         <h1 className = "mx-auto mt-4 max-w-[40rem] text-[2.6rem] font-semibold leading-[3rem] text-primary sm:text-5xl">
            { title }
         </h1>
         <p className = "mx-auto mt-3 max-w-[35rem] px-3 text-base text-gray-500 sm:px-8 sm:text-lg dark:text-gray-400">
            { description }
         </p>
      </div>
   );
}