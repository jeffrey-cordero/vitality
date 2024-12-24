import clsx from "clsx";

interface CardProps {
   className: string;
   children: JSX.Element;
}

function Card(props: CardProps): JSX.Element {
   const { className, children } = props;

   return (
      <div className = { clsx("flex items-center justify-center rounded-2xl bg-white text-center shadow-md dark:bg-slate-800", className) }>
         { children }
      </div>
   );
}

interface CardsProps {
   className: string;
   children: JSX.Element[];
}

export default function Cards(props: CardsProps): JSX.Element {
   const { className, children } = props;

   return (
      <div className = "mx-auto w-full">
         <div className = "container relative mx-auto my-8 flex flex-row flex-wrap items-center justify-center gap-8 p-2 md:my-12 xl:flex-nowrap">
            {
               children.map((child: JSX.Element, index: number) => {
                  return (
                     <Card
                        className = {
                           clsx(className, {
                              "w-[30rem] md:w-80" : index <= 1,
                              "w-[30rem] md:w-[42rem] xl:w-80": index > 1
                           })
                        }
                        key = { index }
                     >
                        { child }
                     </Card>
                  );
               })
            }
         </div>
      </div>
   );
}