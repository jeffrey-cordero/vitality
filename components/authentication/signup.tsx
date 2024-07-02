"use client";
import Heading from "@/components/global/heading";
import Input from "@/components/global/input";
import Notification from "@/components/global/notification";
import Button from "@/components/global/button";
import Link from "next/link";
import { FormEvent, useReducer } from "react";
import { useImmer } from "use-immer";
import { initialFormState, FormState, formReducer, FormResponse, FormPayload } from "@/lib/global/form";
import { login } from "@/lib/authentication/login";
import { signup, Registration } from "@/lib/authentication/signup";

const formState: FormState = {
   ...initialFormState,
   inputs: {
      username: {
         type: "text",
         id: "username",
         value: "",
         error: null
      }, 
      password: {
         type: "password",
         id: "password",
         value: "",
         error: null
      }, 
      confirmPassword: {
         type: "password",
         id: "confirmPassword",
         value: "",
         error: null
      }, 
      name: {
         type: "text",
         id: "name",
         value: "",
         error: null
      }, 
      birthday: {
         type: "date",
         id: "birthday",
         value: "",
         error: null
      },
      email: {
         type: "email",
         id: "email",
         value: "",
         error: null
      }, phone: {
         type: "tel",
         id: "phone",
         value: "",
         error: null
      }
   }
}

function Form(): JSX.Element {
   const [state, dispatch] = useReducer(formReducer, formState);

   const handleSubmit = async(event: FormEvent) => {
      event.preventDefault();

      try {
         dispatch({
            type: 'constructPayload',
            value: null
         });

         if (state.inputs.phone.value.trim() === "") {
            const payload = state.payload as FormPayload;
            const payloadWithoutPhone = (({ phone, ...rest }) => rest)(payload);

            dispatch({
               type: 'updatePayload',
               value: payloadWithoutPhone
            });
         }

         // Update current status of form to show potential success notification
         const response = await signup(state.payload as Registration);

         console.log(1223);
         console.log(response);

         dispatch({
            type: 'updateStatus',
            value: response
         });
      } catch (error) {
         console.error("Error updating status:", error);
      }
   };

   return (
      <div className = "w-10/12 lg:w-1/2 mx-auto">
         <form className = "w-full mx-auto flex flex-col justify-center align-center gap-3" onSubmit = {handleSubmit}>
            <Input input = {state.inputs.username} label="Username *" dispatch = {dispatch} />

            <Input input = {state.inputs.password} label="Password *" dispatch = {dispatch} />
            <Input input = {state.inputs.confirmPassword} label="Confirm Password *" dispatch = {dispatch} />
            <Input input = {state.inputs.name} label= "Name *" dispatch = {dispatch} />
            <Input input = {state.inputs.birthday} label="Birthday *" dispatch = {dispatch} />
            <Input input = {state.inputs.email} label="Email *" dispatch = {dispatch} />
            <Input input = {state.inputs.phone} label="Phone *" dispatch = {dispatch} />
            <Button type = "submit" className = "bg-primary text-white h-[2.6rem]">
               Submit
            </Button>
         </form>
         <p className = "mt-4">Already have an account? <Link href = "/login" className = "text-primary font-bold underline">Log In</Link></p>
         {
            (state.status === "Success" || state.status === "Failure") && (
               <Notification state = {state}>
                  {(state.status === "Success") &&
                     <Link href = "/home">
                        <Button
                           type = "button"
                           className = "bg-green-600 text-white p-4 text-sm h-[2rem]"
                           onClick = {async() => {
                              await login({
                                 username: state.inputs.username.value,
                                 password: state.inputs.password.value
                              });
                           }}
                        >
                           Log In
                        </Button>
                     </Link>
                  }
               </Notification>
            )
         }
      </div>
   );
}

export default function SignUpForm(): JSX.Element {
   return (
      <>
         <div className = "w-full mx-auto flex flex-col items-center justify-center text-center">
            <Heading title = "Sign Up" description = "Create an account to get started" />
            <Form />
         </div>
      </>
   );
}