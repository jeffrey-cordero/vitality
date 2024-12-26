interface HeadingProps {
  title: string;
  message: string;
}

export default function Heading(props: HeadingProps): JSX.Element {
   const { title, message } = props;

   return (
      <div className = "relative mx-auto overflow-hidden px-2 text-center sm:px-6">
         <h1 className = "my-4 text-[2.4rem] font-bold leading-none tracking-tight text-primary xxsm:text-[2.7rem] sm:text-5xl lg:text-[3.5rem]">
            { title }
         </h1>
         <p className = "px-2 text-base font-normal text-gray-500 xxsm:text-base xsm:px-8 sm:px-16 sm:text-lg lg:text-xl xl:px-48 dark:text-gray-400">
            { message }
         </p>
      </div>
   );
}