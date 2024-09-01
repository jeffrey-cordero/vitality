import Journey from "@/components/landing/journey";
import Highlights from "@/components/landing/highlights";
import Services from "@/components/landing/services";
import Pricing from "@/components/landing/pricing";
import Testimonials from "@/components/landing/testimonials";

export default function Page() {
   return (
      <>
         <main className = "w-full min-h-screen flex flex-col items-center justify-start md:px-4 text-center overflow-hidden">
            <Journey />
            <Highlights />
            <Services />
            <Pricing />
            <Testimonials />
         </main>
      </>
   );
}