import LoginForm from "@/components/authentication/login";

export default function LoginPage () {
   return (
      <main className = "animate-slideIn flex min-h-screen w-full flex-col items-center justify-start p-4 text-center">
         <LoginForm />
      </main>
   );
}