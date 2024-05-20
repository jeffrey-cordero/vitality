import FeedbackForm from "@/components/home/feedback/feedback";

export default function Page () {
   return (
      <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-start p-4 text-center">
         <FeedbackForm />
      </main>
   );
}