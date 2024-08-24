"use client";
import { useContext } from "react";
import { AuthenticationContext } from "../layout";

export default function Home() {
   const { user } = useContext(AuthenticationContext);

   const id = user !== undefined ? user.id : "";
   const name = user !== undefined ? user.name : "";
   const email = user !== undefined ? user.email : "";


   return (
      <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-start text-center">
         <h1>Home</h1>
         <p>Your user ID is: {id}</p>
         <p>Welcome back, {name}!</p>
         <p>Your email is: {email}</p>
      </main>
   );
}