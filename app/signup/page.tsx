import SignUpForm from "@/components/authentication/signup";

export default function Page () {
   return (
      <>
         <main className = "w-full mx-auto flex flex-col items-center justify-start px-2 md:px-4 pt-20 text-center overflow-hidden">
            <SignUpForm />
         </main>
      </>
   );
}