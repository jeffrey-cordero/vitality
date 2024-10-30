interface HeadingProps {
   title: string;
   description?: string;
}

export default function Heading(props: HeadingProps): JSX.Element {
   const { title, description } = props;

   return (
      <div className = "relative overflow-hidden">
         <div className = "relative z-10">
            <div className = "max-w-[40rem] mx-auto mb-6 px-4 sm:px-6 lg:px-8">
               <div className = "max-w-2xl text-center mx-auto">
                  <div className = "mt-5 max-w-2xl">
                     <h1 className = "block font-semibold text-primary text-4xl md:text-5xl lg:text-6xl">
                        {title}
                     </h1>
                  </div>
                  <div className = "mt-5 max-w-3xl">
                     <p className = "text-md md:text-lg text-gray-500">
                        {description}
                     </p>
                  </div>
               </div>
            </div>
         </div>

      </div>
   );
}