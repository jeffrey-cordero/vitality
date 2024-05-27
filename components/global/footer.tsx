import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";


export default function Footer (): JSX.Element {
   const year = new Date().getFullYear();
   return (
      <footer className = "w-full mt-8">
         <div className = "w-full mx-auto max-w-screen-xl">
            <div className = "grid grid-cols-2 gap-8 px-4 pt-6 lg:pt-8 md:grid-cols-4 text-center">
               <div>
                  <h2 className = "mb-6 text-md font-bold text-gray-900 uppercase">Company</h2>
                  <ul className = "text-slate-500 font-medium">
                     <li className = "mb-4">
                        <Link href = "#" className = " hover:underline">About</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Careers</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Brand Center</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Blog</Link>
                     </li>
                  </ul>
               </div>
               <div>
                  <h2 className = "mb-6 text-md font-bold text-gray-900 uppercase">Help center</h2>
                  <ul className = "text-slate-500 font-medium">
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">FAQs</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Forums</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Tutorials</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Updates</Link>
                     </li>
                  </ul>
               </div>
               <div>
                  <h2 className = "mb-6 text-md font-bold text-gray-900 uppercase">Legal</h2>
                  <ul className = "text-slate-500 font-medium">
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Terms &amp; Conditions</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Licensing</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Privacy Policy</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Cookie Policy</Link>
                     </li>
                  </ul>
               </div>
               <div>
                  <h2 className = "mb-6 text-md font-bold text-gray-900 uppercase">Download</h2>
                  <ul className = "text-slate-500 font-medium">
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">iOS</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Android</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">Windows</Link>
                     </li>
                     <li className = "mb-4">
                        <Link href = "#" className = "hover:underline">MacOS</Link>
                     </li>
                  </ul>
               </div>
            </div>
            <div className = "flex flex-col justify-center items-center my-6 gap-4">
               <Link href = "https://github.com/jeffrey-asm/vitality" target = "_blank" className = "text-black hover:text-slate-500">
                  <FontAwesomeIcon icon = {faGithub} className = "text-xl" />
               </Link>
               <span className = "text-sm text-black sm:text-center font-bold">© {year} <Link href = "http://localhost:3000">Vitality™</Link>. All Rights Reserved.
               </span>
            </div>
         </div>
      </footer>
   );
}