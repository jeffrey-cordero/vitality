interface HeadingProps {
  title: string;
  message: string;
}

export default function Heading(props: HeadingProps): JSX.Element {
   const { title, message } = props;

   return (
      <div className = "relative mx-auto overflow-hidden px-2 text-center sm:px-4 lg:px-6">
         <h1 className = "my-4 text-[2rem] font-bold leading-none tracking-tight text-primary xxsm:text-4xl md:text-5xl">
            { title }
         </h1>
         <p className = "text-base font-normal text-gray-500 xxsm:text-lg sm:px-16 lg:text-xl xl:px-48 dark:text-gray-400">
            { message }
         </p>
      </div>
   );
}