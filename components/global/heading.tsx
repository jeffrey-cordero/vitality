interface HeadingProps {
  title: string;
  description: string;
}

export default function Heading(props: HeadingProps): JSX.Element {
   const { title, description } = props;

   return (
      <div className = "relative mx-auto mb-2 overflow-hidden px-1 text-center sm:px-4 lg:px-6">
         <h1 className = "mx-auto mt-4 max-w-[30rem] text-[2.2rem] font-semibold leading-[2.7rem] text-primary [overflow-wrap:anywhere] xxsm:text-[2.6rem] sm:max-w-[40rem] sm:text-5xl">
            { title }
         </h1>
         <p className = "mx-auto mt-3 max-w-[25rem] px-0 text-[0.95rem] text-gray-500 xxsm:px-3 xxsm:text-base sm:max-w-[35rem] sm:px-8 sm:text-lg dark:text-gray-400">
            { description }
         </p>
      </div>
   );
}