import Header from "@/components/global/header";
import SignUpForm from "@/components/credentials/signup";

export default function Page() {
   return (
      <>
         <Header />
         <main className="w-full mx-auto flex min-h-screen flex-col items-center justify-start p-4 text-center">
            <SignUpForm />
         </main>
      </>
   );
}