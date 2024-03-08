import Image from 'next/image'

export default function Header(): JSX.Element {
   return (
      <header>
         <nav className="border-gray-200 px-4 lg:px-6 py-2.5">
            <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
               <a href="/" className="flex items-center">
                  <span className="self-center whitespace-nowrap animate-fade-up bg-gradient-to-br from-blue-700 to-blue-500 bg-clip-text text-center font-display text-5xl font-bold tracking-[-0.02em] text-transparent opacity-1 drop-shadow-sm [text-wrap:balance] md:text-4xl md:leading-[5rem]">Vitality Venture</span>
               </a>
               <div className="flex items-center lg:order-2">
                  <a href="/login" className="text-black hover:bg-slate-200 hover:shadow-2xl focus:shadow-2xl focus:ring-4 focus:ring-slate-200 font-medium rounded-lg text-md px-4 lg:px-5 py-2 lg:py-2.5 mr-2  focus:outline-none transition-transform transform hover:scale-105">Log in</a>
                  
                  <a href="/signup" className="text-white bg-blue-700 focus:shadow-2xl focus:ring-4 focus:ring-slate-200 font-medium rounded-lg text-md px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none transition-transform transform hover:scale-105">Sign Up</a>
               </div>
            </div>
         </nav>
      </header>
   )
}