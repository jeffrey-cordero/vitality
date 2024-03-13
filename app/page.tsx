import Header from "@/components/home/header";
import SectionHeading from "@/components/home/section-heading";
import Journey from "@/components/home/journey";

import Card from "@/components/home/card";
import { faPaintbrush } from "@fortawesome/free-solid-svg-icons";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { faChartColumn } from "@fortawesome/free-solid-svg-icons";

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

          <div className="flex flex-row flex-wrap gap-12 justify-center align-center my-12">
            <Card
              icon={faPaintbrush}
              title="Modern Design"
              description="Carefully crafted a precise design, with harmonious typography and perfect padding around every component"
            />
            <Card
              icon={faCode}
              title="Efficiency"
              description="Achieve your goals efficiently and effectively with data-driven insights and a multitude of analytic tools right at your fingertips."
            />
            <Card
              icon={faChartColumn}
              title="Diversity"
              description="A diverse range of fitness trackers tailored to suit every lifestyle and fitness goal. We’ve got your fitness journey covered"
            />
          </div>
        </div>

        <div className="w-100 mx-auto">
          <SectionHeading
            title="Our Services"
            description="With a commitment to innovation, we're constantly exploring new avenues to enhance your wellness experience"
          />
        </div>
      </main>
    </>

  );
}
