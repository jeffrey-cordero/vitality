import Header from "@/components/home/header";
import Journey from "@/components/home/journey";
import Highlights from "@/components/home/highlights";
import Services from "@/components/home/services";
import Pricing from "@/components/home/pricing";
import Testimonials from "@/components/home/testimonials";
import FeedbackForm from "@/components/home/feedback";
import Footer from "@/components/global/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="animate-slideIn flex min-h-screen w-full flex-col items-center justify-start p-4 text-center">
        <Journey />
        <Highlights />
        <Services />
        <Testimonials />
        <Pricing />
        <FeedbackForm />
        <Footer />
      </main>
    </>

  );
}
