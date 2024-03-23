import Header from "@/components/home/header";
import Journey from "@/components/home/journey";
import Highlights from "@/components/home/highlights";
import Services from "@/components/home/services";
import Testimonials from "@/components/home/testimonials";
import Survey from "@/components/home/survey";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen w-full flex-col items-center justify-start p-4 text-center">
        <Journey />
        <Highlights />
        <Services />
        <Testimonials />
        <Survey />
      </main>
    </>

  );
}
