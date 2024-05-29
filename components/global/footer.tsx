import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";


export default function Footer (): JSX.Element {
   const year = new Date().getFullYear();
   return (
      <footer className = "w-full mt-8">
         <div className = "w-full mx-auto max-w-screen-xl">
            <div className = "flex flex-col justify-center items-center my-6 gap-4">
               <Link href = "https://github.com/jeffrey-asm/vitality" target = "_blank" className = "text-black hover:text-slate-500">
                  <FontAwesomeIcon icon = {faGithub} className = "text-2xl" />
               </Link>
               <span className = "text-sm text-black sm:text-center font-bold">© {year} <Link href = "http://localhost:3000">Vitality™</Link>. All Rights Reserved.
               </span>
            </div>
         </div>
      </footer>
   );
}