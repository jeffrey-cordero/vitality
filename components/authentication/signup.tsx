"use client";
import Heading from "@/components/global/heading";
import Input from "@/components/global/input";
import Button from "@/components/global/button";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faArrowRotateLeft,
   faDoorOpen,
   faFeather,
   faKey,
   faEnvelope,
   faPhone,
   faUserSecret,
   faCalendar,
   faUserCheck
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useContext, useReducer } from "react";
import {
   VitalityState,
   formReducer
} from "@/lib/global/state";
import { handleResponse, VitalityResponse } from "@/lib/global/response";
import { login } from "@/lib/authentication/login";
import { signup, Registration } from "@/lib/authentication/signup";
import { NotificationContext } from "@/app/layout";

const registration: VitalityState = {
   username: {
      value: "",
      error: null,
      data: {}
   },
   password: {
      value: "",
      error: null,
      data: {}
   },
   confirmPassword: {
      value: "",
      error: null,
      data: {}
   },
   name: {
      value: "",
      error: null,
      data: {}
   },
   birthday: {
      value: "",
      error: null,
      data: {}
   },
   email: {
      value: "",
      error: null,
      data: {}
   },
   phone: {
      value: "",
      error: null,
      data: {}
   }
};

function Form(): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, registration);

   const handleSubmit = async(event: FormEvent) => {
      event.preventDefault();

      const registration: Registration = {
         name: state.name.value.trim(),
         username: state.username.value.trim(),
         password: state.password.value.trim(),
         confirmPassword: state.confirmPassword.value.trim(),
         email: state.email.value.trim(),
         birthday: new Date(state.birthday.value),
         phone: state.phone.value.trim()
      };
      const response: VitalityResponse<null> = await signup(registration);

      const successMethod = () => {
         // Display login notification
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
                           username: state.username.value,
                           password: state.password.value
                        });

                        window.location.reload();
                     }}>
                        Log In
                  </Button>
               </Link>
            )
         });
      };

      handleResponse(dispatch, response, successMethod, updateNotification);
   };

   return (
      <div className = "w-10/12 lg:w-1/2 mx-auto mt-6">
         <form
            className = "relative w-full mx-auto flex flex-col justify-center align-center gap-3"
            onSubmit = {handleSubmit}>
            <FontAwesomeIcon
               icon = {faArrowRotateLeft}
               onClick = {() =>
                  dispatch({
                     type: "resetState",
                     value: {}
                  })
               }
               className = "absolute top-[-25px] right-[10px] z-10 flex-shrink-0 size-3.5 text-md text-primary cursor-pointer"
            />
            <Input
               id = "username"
               type = "text"
               label = "Username"
               autoComplete = "username"
               icon = {faUserSecret}
               input = {state.username}
               dispatch = {dispatch}
               autoFocus
               required
            />
            <Input
               id = "password"
               type = "password"
               label = "Password"
               autoComplete = "new-password"
               icon = {faKey}
               input = {state.password}
               dispatch = {dispatch}
               required
            />
            <Input
               id = "confirmPassword"
               type = "password"
               label = "Confirm Password"
               autoComplete = "new-password"
               icon = {faKey}
               input = {state.confirmPassword}
               dispatch = {dispatch}
               required
            />
            <Input
               id = "name"
               type = "text"
               label = "Name"
               autoComplete = "name"
               icon = {faFeather}
               input = {state.name}
               dispatch = {dispatch}
               required
            />
            <Input
               id = "birthday"
               type = "date"
               label = "Birthday"
               name = "bday"
               autoComplete = "bday"
               icon = {faCalendar}
               input = {state.birthday}
               dispatch = {dispatch}
               required
            />
            <Input
               id = "email"
               type = "email"
               label = "Email"
               autoComplete = "email"
               icon = {faEnvelope}
               input = {state.email}
               dispatch = {dispatch}
               required
            />
            <Input
               id = "phone"
               type = "tel"
               label = "Phone"
               autoComplete = "tel"
               icon = {faPhone}
               input = {state.phone}
               dispatch = {dispatch}
            />
            <Button
               type = "submit"
               className = "bg-primary text-white h-[2.6rem]"
               icon = {faUserCheck}>
          Register
            </Button>
         </form>
         <p className = "mt-4">
        Already have an account?{" "}
            <Link
               href = "/login"
               className = "text-primary font-bold">
          Log In
            </Link>
         </p>
      </div>
   );
}

export default function SignUpForm(): JSX.Element {
   return (
      <div className = "w-full mx-auto mt-6 flex flex-col items-center justify-center text-center">
         <Heading
            title = "Sign Up"
            description = "Create an account to get started"
         />
         <Form />
      </div>
   );
}
