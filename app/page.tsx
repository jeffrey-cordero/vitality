import Main from "@/components/global/main";
import Journey from "@/components/landing/journey";
import Highlights from "@/components/landing/highlights";
import Services from "@/components/landing/services";
import Pricing from "@/components/landing/pricing";
import Testimonials from "@/components/landing/testimonials";

export default function Page() {
   return (
      <Main>
         <Journey />
         <Highlights />
         <Services />
         <Pricing />
         <Testimonials />
      </Main>
   );
}