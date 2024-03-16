export default function SectionHeading({ title, description }: { title: string, description?: string }): JSX.Element {
   return (
      <div className="w-100 mt-8">
         <h1
            className="animate-fade-up text-blue-700 text-3xl font-bold tracking-[-0.02em] opacity-1 drop-shadow-sm [text-wrap:balance] md:text-5xl md:leading-[3.2rem] w-1/2 mx-auto"
            style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
         >
            {title}
         </h1>
         {
            description &&
            <p className='text-xl font-medium text-slate-400 w-3/5 mx-auto mt-8'>
               {description}
            </p>
         }

      </div>
   )
}