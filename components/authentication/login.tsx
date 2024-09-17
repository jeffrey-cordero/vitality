"use client";
import Link from "next/link";
import Heading from "@/components/global/heading";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import Notification from "@/components/global/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faUnlockKeyhole } from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useContext, useReducer } from "react";
import { FormState, formReducer, FormResponse, constructPayload, FormPayload } from "@/lib/global/form";
import { login, Credentials } from "@/lib/authentication/login";
import { NotificationContext } from "@/app/layout";

const form: FormState = {
   status: "Initial",
   inputs: {
      username: {
         type: "text",
         id: "username",
         value: "",
         defaultValue: "",
         error: null,
         data: {}
      }, password: {
         type: "password",
         id: "password",
         value: "",
         defaultValue: "",
         error: null,
         data: {}
      }
   },
   response: null
};

function Form(): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, form);

   const handleSubmit = async(event: FormEvent) => {
      event.preventDefault();

      try {
         const payload: FormPayload = constructPayload(state.inputs);
         const response: FormResponse = await login(payload as Credentials);

         dispatch({
            type: "updateStatus",
            value: response
         });

         if (response.status === "Failure") {
            // Display the failure notification to the user
            updateNotification({
               status: response.status,
               message: response.body.message
            });
         }
      } catch (error) {
         console.error("Error updating status:", error);
      }
   };

   return (
      <div className = "w-10/12 lg:w-1/2 mx-auto">
         <form className = "relative w-full flex flex-col justify-center align-center gap-3" onSubmit = {handleSubmit}>
            <FontAwesomeIcon
               icon = {faArrowRotateLeft}
               onClick = {() => dispatch({
                  type: "resetForm", value: null
               })}
               className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
            />
            <Input input = {state.inputs.username} label = "Username *" dispatch = {dispatch} />
            <Input input = {state.inputs.password} label = "Password *" dispatch = {dispatch} />
            <Button type = "submit" className = "bg-primary text-white h-[2.6rem]" icon = {faUnlockKeyhole}>
               Submit
            </Button>
         </form>
         <p className = "mt-4">Don&apos;t have an account? <Link href = "/signup" className = "text-primary font-bold">Register</Link></p>
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