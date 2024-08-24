import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faYoutube, faXTwitter, faMeta } from "@fortawesome/free-brands-svg-icons";

export default function Footer(): JSX.Element {
   const year = new Date().getFullYear();
   return (
      <footer className = "w-full mt-32">
         <div className = "w-full mx-auto max-w-screen-xl">
            <div className = "flex flex-col sm:flex-row flex-1 justify-center sm:justify-between gap-5 align-middle items-center text-center m-4">
               <div>
                  <ul className = "flex flex-row gap-6 text-sm font-bold">
                     <li>
                        <Link className = "hover:text-slate-500" href = "http://localhost:3000/#">About</Link>
                     </li>
                     <li>
                        <Link className = "hover:text-slate-500" href = "http://localhost:3000/#">Privacy</Link>
                     </li>
                     <li>
                        <Link className = "hover:text-slate-500" href = "http://localhost:3000/#">Policy</Link>
                     </li>
                     <li>
                        <Link className = "hover:text-slate-500" href = "http://localhost:3000/#">Contact</Link>
                     </li>
                  </ul>
               </div>
               <div>
                  <ul className = "flex flex-row gap-6 text-sm font-bold">
                     <li>
                        <Link href = "https://github.com/jeffrey-asm/vitality" target = "_blank" className = "text-black hover:text-slate-500">
                           <FontAwesomeIcon icon = {faGithub} className = "text-2xl" />
                        </Link>
                     </li>
                     <li>
                        <Link href = "https://twitter.com/" target = "_blank" className = "text-black hover:text-slate-500">
                           <FontAwesomeIcon icon = {faXTwitter} className = "text-2xl" />
                        </Link>
                     </li>
                     <li>
                        <Link href = "https://meta.com/" target = "_blank" className = "text-black hover:text-slate-500">
                           <FontAwesomeIcon icon = {faMeta} className = "text-2xl" />
                        </Link>
                     </li>
                     <li>
                        <Link href = "https://youtube.com/" target = "_blank" className = "text-black hover:text-slate-500">
                           <FontAwesomeIcon icon = {faYoutube} className = "text-2xl" />
                        </Link>
                     </li>
                  </ul>
               </div>
            </div>
            <div className = "text-center m-4">
               <span className = "text-sm text-black sm:text-center font-bold">© {year} <Link href = "http://localhost:3000">Vitality™</Link>. All Rights Reserved.
               </span>
            </div>
         </div>
      </footer>
   );
}