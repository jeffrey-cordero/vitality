import SignUpForm from "@/components/authentication/signup-form";
import Heading from "@/components/landing/heading";

export default function SignUpPage () {
   return (
      <main className = "animate-slideIn flex min-h-screen w-full flex-col items-center justify-start p-4 text-center">
         <SignUpForm />
      </main>
   );
}