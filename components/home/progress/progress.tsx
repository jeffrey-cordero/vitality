import { faEarthEurope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Progress(): JSX.Element {
   return (
      <main className = "relative w-screen h-screen mx-auto mt-8 flex flex-col justify-center items-center font-bold text-center gap-2 overscroll-y-none">
         <FontAwesomeIcon
            icon = {faEarthEurope}
            className = "text-primary text-3xl"
         />
         <h1 className = "text-xl">Coming Soon</h1>
      </main>
   );
}
