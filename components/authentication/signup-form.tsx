"use client";
import { FormEvent, useEffect } from "react";
import { useImmer } from "use-immer";
import { InputState, FormRepresentation, handleInputChange } from "@/lib/form";
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
            onChange: (event) => { handleInputChange(event, setUser); },
         }, password: {
            label: "Password *",
            type: "password",
            isPassword: true,
            id: "password",
            value: "",
            error: null,
            onChange: (event) => { handleInputChange(event, setUser); }
         }, confirmPassword: {
            label: "Confirm Password *",
            type: "password",
            isPassword: true,
            id: "confirmPassword",
            value: "",
            error: null,
            onChange: (event) => { handleInputChange(event, setUser); }
         }, name: {
            label: "Name *",
            type: "text",
            id: "name",
            value: "",
            error: null,
            onChange: (event) => { handleInputChange(event, setUser); }
         }, birthday: {
            label: "Birthday *",
            type: "date",
            id: "birthday",
            value: new Date(),
            error: null,
            onChange: (event) => { handleInputChange(event, setUser); }
         },
         email: {
            label: "Email *",
            type: "email",
            id: "email",
            value: "",
            error: null,
            onChange: (event) => { handleInputChange(event, setUser); }
         }, phone: {
            label: "Phone",
            type: "tel",
            id: "phone",
            value: "",
            error: null,
            onChange: (event) => { handleInputChange(event, setUser); }
         }
      });

   useEffect(() => {
      setUser((inputs: FormRepresentation) => {
         inputs["password"].setInput = inputs["confirmPassword"].setInput = setUser;
      });
   }, []);

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();

      try {
         // await register(user)
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
            <Input {...user.username} />
            <Input {...user.password} />
            <Input {...user.confirmPassword} />
            <Input {...user.name} />
            <Input {...user.birthday} />
            <Input {...user.email} />
            <Input {...user.phone} />
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