export default function Header (): JSX.Element {
   return (
      <header>
         <nav className = "animate-slideIn border-gray-200 px-4 lg:px-6 py-2.5">
            <div className = "flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
               <a href = "/" className = "flex items-center">
                  <span className = "self-center whitespace-nowrap animate-fade-up text-primary text-center font-display text-5xl font-bold tracking-[-0.02em] opacity-1 drop-shadow-sm [text-wrap:balance] md:text-5xl md:leading-[5rem]">Vitality</span>
               </a>
            </div>
         </nav>
      </header>
   );
}