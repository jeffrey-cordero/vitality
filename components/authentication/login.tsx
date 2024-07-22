"use client";
import Heading from "@/components/global/heading";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import Notification from "@/components/global/notification";
import { FormEvent, useEffect, useReducer } from "react";
import { initialFormState, FormState, formReducer, FormResponse } from "@/lib/global/form";
import { login, Credentials } from "@/lib/authentication/login";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const formState: FormState = {
   ...initialFormState,
   inputs: {
      username: {
         id: "username",
         value: "",
         error: null,
         type: "text",
      }, password: {
         id: "password",
         value: "",
         error: null,
         type: "password"
      }
   }
}

function Form(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, formState);

   useEffect(() => {
      const fetchLogin = async () => {
         const response: FormResponse = await login(state.payload as Credentials);
         dispatch({
            type: 'updateStatus',
            value: response
         });

      };

      if (state.payload) {
         fetchLogin();
      }
   }, [state.payload]);

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();

      try {
         dispatch({
            type: 'constructPayload',
            value: null
         });
      } catch (error) {
         console.error("Error updating status:", error);
      }
   };

   return (
      <div className="w-10/12 lg:w-1/2 mx-auto">
         <form className="relative w-full flex flex-col justify-center align-center gap-3" onSubmit={handleSubmit}>
            <FontAwesomeIcon 
               icon={faArrowRotateLeft} 
               onClick={() => dispatch({
                  type: "resetForm", value: null
               })}
               className="absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer" />
            <Input input={state.inputs.username} label="Username *" dispatch={dispatch} />
            <Input input={state.inputs.password} label="Password *" dispatch={dispatch} />
            <Button type="submit" className="bg-primary text-white h-[2.6rem]">
               Submit
            </Button>
         </form>
         <p className="mt-4">Don&apos;t have an account? <Link href="/signup" className="text-primary font-bold underline">Register</Link></p>
         <p className="mt-2"><Link href="/forgot" className="text-primary font-bold underline">Forgot Password</Link></p>
         {
            formState.status === "Failure" && <Notification state={formState} />
         }
      </div>
   );
}

export default function LoginForm(): JSX.Element {
   return (
      <>
         <div className="w-full mx-auto flex flex-col items-center justify-center text-center">
            <Heading title="Log In" description="Enter valid credentials to enter" />
            <Form />
         </div>
      </>
   );
}