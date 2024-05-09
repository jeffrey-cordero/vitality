import Journey from "@/components/landing/journey";
import Highlights from "@/components/landing/highlights";
import Services from "@/components/landing/circle";
import Pricing from "@/components/landing/pricing";
import Testimonials from "@/components/landing/testimonials";
import Footer from "@/components/global/footer";

export default function Landing () {
   return (
      <>
         <main className = "animate-slideIn flex min-h-screen w-full flex-col items-center justify-start p-4 text-center">
            <Journey />
            <Highlights />
            <Services />
            <Pricing />
            <Testimonials />
            <Footer />
         </main>
      </>
   );
}
