import Header from "@/components/global/header";
import Journey from "@/components/landing/journey";
import Highlights from "@/components/landing/highlights";
import Services from "@/components/landing/services";
import Pricing from "@/components/landing/pricing";
import Testimonials from "@/components/landing/testimonials";
import Footer from "@/components/global/footer";


export default function Page () {
   return (
      <>
         <Header />
         <main className = "animate-slideIn w-full mx-auto flex min-h-screen flex-col items-center justify-start p-4 text-center">
            <Journey />
            <Highlights />
            <Services />
            <Pricing />
            <Testimonials />
         </main>
         <Footer />
      </>
   );
}