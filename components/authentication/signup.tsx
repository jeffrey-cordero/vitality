"use client";
import Heading from "@/components/global/heading";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faIdCard, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useContext, useReducer } from "react";
import { VitalityState, formReducer, VitalityResponse } from "@/lib/global/state";
import { login } from "@/lib/authentication/login";
import { signup, Registration } from "@/lib/authentication/signup";
import { NotificationContext } from "@/app/layout";

const registration: VitalityState = {
   status: "Initial",
   inputs: {
      username: {
         type: "text",
         id: "username",
         value: "",
         error: null,
         data: {}
      },
      password: {
         type: "password",
         id: "password",
         value: "",
         error: null,
         data: {}
      },
      confirmPassword: {
         type: "password",
         id: "confirmPassword",
         value: "",
         error: null,
         data: {}
      },
      name: {
         type: "text",
         id: "name",
         value: "",
         error: null,
         data: {}
      },
      birthday: {
         type: "date",
         id: "birthday",
         value: "",
         error: null,
         data: {}
      },
      email: {
         type: "email",
         id: "email",
         value: "",
         error: null,
         data: {}
      }, phone: {
         type: "tel",
         id: "phone",
         value: "",
         error: null,
         data: {}
      }
   },
   response: null
};

function Form(): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, registration);

   const handleSubmit = async(event: FormEvent) => {
      event.preventDefault();

      try {
         const payload: Registration = {
            name: state.inputs.name.value.trim(),
            username: state.inputs.username.value.trim(),
            password: state.inputs.password.value.trim(),
            confirmPassword: state.inputs.confirmPassword.value.trim(),
            email: state.inputs.email.value.trim(),
            birthday: new Date(state.inputs.birthday.value),
            phone: state.inputs.phone.value.trim()
         };
         const response: VitalityResponse<null> = await signup(payload as Registration);

         dispatch({
            type: "updateStatus",
            value: response
         });

         if (response.status !== "Error") {
            // Display the success or failure notification to the user
            updateNotification({
               status: response.status,
               message: response.body.message,
               children: (
                  <Link href = "/home">
                     <Button
                        type = "button"
                        className = "bg-green-600 text-white p-4 text-sm h-[2rem]"
                        icon = {faDoorOpen}
                        onClick = {async() => {
                           await login({
                              username: state.inputs.username.value,
                              password: state.inputs.password.value
                           });

                           window.location.reload();
                        }}
                     >
                        Log In
                     </Button>
                  </Link>
               )
            });
         }
      } catch (error) {
         console.error(error);
      }
   };

   return (
      <div className = "w-10/12 lg:w-1/2 mx-auto">
         <form className = "relative w-full mx-auto flex flex-col justify-center align-center gap-3" onSubmit = {handleSubmit}>
            <FontAwesomeIcon
               icon = {faArrowRotateLeft}
               onClick = {() => dispatch({
                  type: "resetState", value: {}
               })}
               className = "absolute top-[-25px] right-[15px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
            />
            <Input input = {state.inputs.username} label = "Username *" dispatch = {dispatch} />
            <Input input = {state.inputs.password} label = "Password *" dispatch = {dispatch} />
            <Input input = {state.inputs.confirmPassword} label = "Confirm Password *" dispatch = {dispatch} />
            <Input input = {state.inputs.name} label = "Name *" dispatch = {dispatch} />
            <Input input = {state.inputs.birthday} label = "Birthday *" dispatch = {dispatch} />
            <Input input = {state.inputs.email} label = "Email *" dispatch = {dispatch} />
            <Input input = {state.inputs.phone} label = "Phone *" dispatch = {dispatch} />
            <Button type = "submit" className = "bg-primary text-white h-[2.6rem]" icon = {faIdCard}>
               Submit
            </Button>
         </form>
         <p className = "mt-4">Already have an account? <Link href = "/login" className = "text-primary font-bold">Log In</Link></p>
      </div>
   );
}

export default function SignUpForm(): JSX.Element {
   return (
      <div className = "w-full mx-auto flex flex-col items-center justify-center text-center">
         <Heading title = "Sign Up" description = "Create an account to get started" />
         <Form />
      </div>
   );
}