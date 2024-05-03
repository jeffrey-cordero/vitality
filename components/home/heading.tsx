export default function Heading({ title, description }: { title: string, description?: string }): JSX.Element {
   return (
      <div className='w-full my-12'>
         <h1
            className='text-primary text-4xl md:text-5xl w-full sm:w-3/5  font-bold mx-auto'
         >
            {title}
         </h1>
         {
            description &&
            <p className='text-xl font-medium text-slate-500 w-4/5 sm:w-3/5 mx-auto mt-8'>
               {description}
            </p>
         }
      </div>
   )
}