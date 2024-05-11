import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import Circle from "@/components/landing/spinner";

export default function Journey (): JSX.Element {
   return (
      <div className = "w-full mx-auto">
         <Heading
            title = "Your Fitness Journey Starts Here"
            description = "Your ultimate companion for achieving optimal health and fitness"
         />
         <div className = "overflow-hidden">
            <div className = "container mx-auto">
               <div className = "flex flex-wrap items-center justify-center mx-2">
                  <div className = "w-full lg:w-6/12">
                     <div className = "flex items-center -mx-3 sm:-mx-4">
                        <div className = "w-full sm:px-4 xl:w-1/2">
                           <div className = "py-3 sm:py-4">
                              <div className = "relative my-4">
                                 <img
                                    src = "/journey.jpg"
                                    alt = ""
                                    className = "w-full h-full shadow-xl rounded-2xl hover:scale-[1.05] transition duration-300 ease-in-out"
                                 />
                              </div>
                              <div className = "relative my-4">
                                 <img
                                    src = "/food.jpg"
                                    alt = ""
                                    className = "w-full h-full shadow-xl rounded-2xl hover:scale-[1.05] transition duration-300 ease-in-out"
                                 />
                              </div>
                           </div>

                        </div>
                        <div className = "w-full px-3 sm:px-4 xl:w-1/2">
                           <div className = "py-3 sm:py-4">
                              <img
                                 src = "/mountains.jpg"
                                 alt = ""
                                 className = "w-full h-full shadow-xl rounded-2xl hover:scale-[1.05] transition duration-300 ease-in-out"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className = "w-full lg:w-1/2 xl:w-5/12">
                     <div className = "mt-10 lg:mt-0">
                        <Circle />
                        <span className = "block mb-6 max-w-10/12 text-4xl font-bold text-primary">
                           Level Up Your Fitness
                        </span>
                        <p className = "w-3/4 mx-auto mb-8 text-semibold text-body-color">
                           Discover the power of tracking your fitness journey as you strive towards your goals. By monitoring your progress, you gain valuable insights, stay accountable, and fuel your motivation.
                        </p>
                        <a href = "login">
                           <Button className = "text-white text-md bg-primary whitespace-nowrap w-[9rem] h-[3.2rem] text-lg">
                              Start Today
                           </Button>
                        </a>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}