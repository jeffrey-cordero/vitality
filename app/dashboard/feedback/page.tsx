import FeedbackForm from "@/components/dashboard/feedback/feedback-form";
import Header from "@/components/global/header";

export default function Page (): JSX.Element {
   return (
      <div className = "animate-slideIn flex min-h-screen w-full flex-col items-center justify-center p-4 text-center">
         <Header />
         <FeedbackForm />
      </div>
   );
}