import Header from "@/components/home/header";
import SectionHeading from "@/components/home/section-heading";
import Journey from "@/components/home/journey";
import Highlights from "@/components/home/highlights";
import Services from "@/components/home/services";
import Testimonials from "@/components/home/testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen w-full flex-col items-center justify-start p-4 text-center">
        <div className="w-100 mx-auto">
          <SectionHeading
            title="Your Fitness Journey Starts Here"
            description="Welcome to our fitness tracker app – your ultimate companion for achieving optimal health and fitness"
          />
          <Journey />
        </div>
        <div className="w-100 mx-auto mt-8">
          <SectionHeading
            title="Why Us?"
            description='We"ve developed a cutting-edge fitness tracker that empowers users to effortlessly monitor their progress, set goals, and achieve optimal fitness levels'
          />
          <Highlights />
        </div>

        <div className="w-100 mx-auto">
          <SectionHeading
            title="Our Services"
            description="With a commitment to innovation, we're constantly exploring new avenues to enhance your wellness experience"
          />
          <Services />
        </div>
        <div className="w-100 mx-auto">
          <SectionHeading
            title="Testimonials"
            description="Discover the firsthand experiences of our valued users as they share insights into their fitness journey with our app"
          />
          <Testimonials />
        </div>
      </main>
    </>

  );
}
