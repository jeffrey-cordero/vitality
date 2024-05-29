import SignUpForm from "@/components/authentication/signup";

export default function Page () {
   return (
      <>
         <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-start pt-20 px-2 md:px-4 text-center overflow-hidden">
            <SignUpForm />
         </main>
      </>
   );
}