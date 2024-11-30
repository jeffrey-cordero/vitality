import SignUp from "@/components/authentication/signup";

export default function Page() {
   return (
      <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-start px-2 md:px-4 mt-10 mb-20 text-center overflow-hidden">
         <SignUp />
      </main>
   );
}