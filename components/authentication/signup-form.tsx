"use client";
import { FormEvent, useEffect } from "react";
import { useImmer } from "use-immer";
import { FormRepresentation } from "@/lib/form";
import { register, RegisterUser as User } from "@/lib/authentication";
import Heading from "@/components/landing/heading";
import { Input } from "@/components/global/form";
import { Notification } from "@/components/global/notification";
import Button from "@/components/global/button";

function Form (): JSX.Element {
   const [user, setUser] = useImmer<FormRepresentation>(
      {
         username: {
            label: "Username *",
            type: "text",
            id: "username",
            value: "",
            error: null,
         }, password: {
            label: "Password *",
            type: "password",
            isPassword: true,
            id: "password",
            value: "",
            error: null,
         }, confirmPassword: {
            label: "Confirm Password *",
            type: "password",
            isPassword: true,
            id: "confirmPassword",
            value: "",
            error: null,
         }, name: {
            label: "Name *",
            type: "text",
            id: "name",
            value: "",
            error: null,
         }, birthday: {
            label: "Birthday *",
            type: "date",
            id: "birthday",
            value: "",
            error: null,
         },
         email: {
            label: "Email *",
            type: "email",
            id: "email",
            value: "",
            error: null,
         }, phone: {
            label: "Phone",
            type: "tel",
            id: "phone",
            value: "",
            error: null,
         }
      });

   useEffect(() => {
      setUser((inputs: FormRepresentation) => {
         Object.keys(inputs).forEach((input) => {
            inputs[input].setInputs = setUser;
         });
      });
   }, []);

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();

      try {
         const data : User = {
            name: "",
            birthday: "",
            username: "",
            password: "",
            email: "",
         };

         Object.keys(user).forEach((input) => {
            data[input] = user[input].value;
         });

         await register(data);
      } catch (error) {
         console.log("Error updating status:", error);
      }
   };

   return (
      <div className = "w-full mx-auto">
         <form
            className = "w-1/2 mx-auto flex flex-col justify-center align-center gap-3"
            onSubmit = {handleSubmit}
         >
            <Input input = {user.username} />
            <Input input = {user.password} />
            <Input input = {user.confirmPassword} />
            <Input input = {user.name} />
            <Input input = {user.birthday} />
            <Input input = {user.email} />
            <Input input = {user.phone} />
            <Button
               type = "submit"
               className = "bg-primary text-white"
            >
               Submit
            </Button>
         </form>
      </div>
   );
}

export default function SignUpForm (): JSX.Element {
   return (
      <>
         <div className = "w-full mx-auto flex flex-col items-center justify-center">
            <Heading
               title = "Sign up"
               description = "Create an account to get started"
            />
            <Form />
         </div>
      </>
   );
}