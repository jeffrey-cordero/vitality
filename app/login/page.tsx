import Login from "@/components/authentication/login";

export default function Page() {
   return (
      <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-start px-2 md:px-4 text-center overflow-hidden mt-10 mb-20">
         <Login />
      </main>
   );
}