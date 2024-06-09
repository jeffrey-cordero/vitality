import Journey from "@/components/landing/journey";
import Highlights from "@/components/landing/highlights";
import Services from "@/components/landing/services";
import Pricing from "@/components/landing/pricing";
import Testimonials from "@/components/landing/testimonials";

export default function Page() {
   return (
      <>
         <main className = "w-full flex min-h-screen flex-col items-center justify-start mx-2 md:px-4 py-12 text-center overflow-hidden">
            <Journey />
            <Highlights />
            <Services />
            <Pricing />
            <Testimonials />
         </main>
      </>
   );
}