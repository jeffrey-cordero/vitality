"use client";
import Heading from "@/components/global/heading";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import Notification from "@/components/global/notification";
import { FormEvent } from "react";
import { useImmer } from "use-immer";
import { FormItems, handleFormErrors, SubmissionStatus } from "@/lib/global/form";
import { login, Credentials } from "@/lib/authentication/login";
import Link from "next/link";

function Form(): JSX.Element {
   const [status, setStatus] = useImmer<SubmissionStatus>({ state: "Initial", response: {}, errors: {} });
   const [credentials, setCredentials] = useImmer<FormItems>(
      {
         username: {
            label: "Username *",
            type: "text",
            id: "username",
            value: "",
            error: null
         }, password: {
            label: "Password *",
            type: "password",
            isPassword: true,
            id: "password",
            value: "",
            error: null
         }
      });

   const handleSubmit = async(event: FormEvent) => {
      event.preventDefault();

      try {
         const payload: Credentials = {
            username: credentials.username.value,
            password: credentials.password.value
         };

         const response = await login(payload);
         setStatus(response);
         handleFormErrors(response, credentials, setCredentials);
      } catch (error) {
         console.error("Error updating status:", error);
      }
   };

   return (
      <div className = "w-10/12 lg:w-1/2 mx-auto">
         <form className = "w-full flex flex-col justify-center align-center gap-3" onSubmit = {handleSubmit}>
            <Input input = {credentials.username} updater = {setCredentials} />
            <Input input = {credentials.password} updater = {setCredentials} />
            <Button type = "submit" className = "bg-primary text-white h-[2.6rem]">
               Submit
            </Button>
         </form>
         <p className = "mt-4">Don&apos;t have an account? <Link href = "/signup" className = "text-primary font-bold underline">Register</Link></p>
         <p className = "mt-2"><Link href = "/forgot" className = "text-primary font-bold underline">Forgot Password</Link></p>
         {
            (status && status.state === "Failure") && (
               <Notification status = {status} />
            )
         }
      </div>
   );
}

export default function LoginForm(): JSX.Element {
   return (
      <>
         <div className = "w-full mx-auto flex flex-col items-center justify-center text-center">
            <Heading title = "Log In" description = "Enter valid credentials to enter" />
            <Form />
         </div>
      </>
   );
}