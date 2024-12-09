import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faYoutube, faXTwitter, faMeta } from "@fortawesome/free-brands-svg-icons";

export default function Footer(): JSX.Element {
   return (
      <footer className = "relative bottom-0 left-0 w-full">
         <div className = "mx-auto w-full max-w-screen-xl">
            <div className = "mx-8 my-4 flex flex-1 flex-col items-center justify-center gap-4 text-center align-middle sm:flex-row sm:justify-between">
               <ul className = "order-2 flex flex-row gap-6 text-sm font-bold sm:order-1">
                  <li>
                     <Link
                        className = "hover:text-slate-500"
                        href = "http://localhost/#"
                     >
                        About
                     </Link>
                  </li>
                  <li>
                     <Link
                        className = "hover:text-slate-500"
                        href = "http://localhost/#"
                     >
                        Privacy
                     </Link>
                  </li>
                  <li>
                     <Link
                        className = "hover:text-slate-500"
                        href = "http://localhost/#"
                     >
                        Policy
                     </Link>
                  </li>
                  <li>
                     <Link
                        className = "hover:text-slate-500"
                        href = "http://localhost/#"
                     >
                        Contact
                     </Link>
                  </li>
               </ul>
               <ul className = "order-1 flex flex-row gap-6 text-sm font-bold sm:order-2">
                  <li>
                     <Link
                        href = "https://github.com/jeffrey-asm/vitality"
                        target = "_blank"
                        className = "hover:text-slate-500"
                     >
                        <FontAwesomeIcon
                           icon = { faGithub }
                           className = "text-2xl"
                        />
                     </Link>
                  </li>
                  <li>
                     <Link
                        href = "https://twitter.com/"
                        target = "_blank"
                        className = "hover:text-slate-500"
                     >
                        <FontAwesomeIcon
                           icon = { faXTwitter }
                           className = "text-2xl"
                        />
                     </Link>
                  </li>
                  <li>
                     <Link
                        href = "https://meta.com/"
                        target = "_blank"
                        className = "hover:text-slate-500"
                     >
                        <FontAwesomeIcon
                           icon = { faMeta }
                           className = "text-2xl"
                        />
                     </Link>
                  </li>
                  <li>
                     <Link
                        href = "https://youtube.com/"
                        target = "_blank"
                        className = "hover:text-slate-500"
                     >
                        <FontAwesomeIcon
                           icon = { faYoutube }
                           className = "text-2xl"
                        />
                     </Link>
                  </li>
               </ul>
            </div>
         </div>
      </footer>
   );
}