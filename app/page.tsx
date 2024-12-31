import Main from "@/components/global/main";
import Highlights from "@/components/landing/highlights";
import Journey from "@/components/landing/journey";
import Pricing from "@/components/landing/pricing";
import Services from "@/components/landing/services";
import Testimonials from "@/components/landing/testimonials";

export default function Page() {
   return (
      <Main className = "gap-2 md:gap-10">
         <Journey />
         <Highlights />
         <Services />
         <Pricing />
         <Testimonials />
      </Main>
   );
}