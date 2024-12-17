"use client";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import Link from "next/link";
import { Input } from "@/components/global/input";
import { login } from "@/lib/authentication/login";
import { NotificationContext } from "@/app/layout";
import { FormEvent, useContext, useReducer } from "react";
import { VitalityState, formReducer } from "@/lib/global/state";
import { signup, Registration } from "@/lib/authentication/signup";
import { handleResponse, VitalityResponse } from "@/lib/global/response";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faDoorOpen, faFeather, faKey, faEnvelope, faPhone, faUserSecret, faCalendar, faUserPlus } from "@fortawesome/free-solid-svg-icons";

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

export default function SignUp(): JSX.Element {
   const { updateNotification } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, registration);

   const handleRegistration = async(event: FormEvent) => {
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

      handleResponse(response, dispatch, updateNotification, () => {
         // Display notification with login button for redirection
         updateNotification({
            status: "Success",
            message: "Successfully registered",
            timer: undefined,
            children: (
               <Link href = "/home">
                  <Button
                     type = "button"
                     className = "h-8 bg-green-600 px-4 py-3 text-sm text-white focus:border-green-800 focus:ring-2 focus:ring-green-800 xsm:px-6 dark:border-0"
                     icon = { faDoorOpen }
                     onClick = {
                        async() => {
                           await login({
                              username: state.username.value,
                              password: state.password.value
                           });

                           window.location.reload();
                        }
                     }
                  >
                     Log In
                  </Button>
               </Link>
            )
         });
      });
   };

   return (
      <div className = "mx-auto mb-12 flex w-full flex-col items-center justify-center text-center">
         <Heading
            title = "Sign Up"
            description = "Create an account to get started"
         />
         <div className = "mx-auto mt-8 w-11/12 sm:w-3/4 xl:w-5/12">
            <form
               className = "relative mx-auto flex w-full flex-col items-stretch justify-center gap-3"
               onSubmit = { handleRegistration }
            >
               <FontAwesomeIcon
                  icon = { faArrowRotateLeft }
                  onClick = {
                     () =>
                        dispatch({
                           type: "resetState",
                           value: {}
                        })
                  }
                  className = "absolute right-[10px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-primary"
               />
               <Input
                  id = "username"
                  type = "text"
                  label = "Username"
                  autoComplete = "username"
                  icon = { faUserSecret }
                  input = { state.username }
                  dispatch = { dispatch }
                  autoFocus
                  required
               />
               <Input
                  id = "password"
                  type = "password"
                  label = "Password"
                  autoComplete = "new-password"
                  icon = { faKey }
                  input = { state.password }
                  dispatch = { dispatch }
                  required
               />
               <Input
                  id = "confirmPassword"
                  type = "password"
                  label = "Confirm Password"
                  autoComplete = "new-password"
                  icon = { faKey }
                  input = { state.confirmPassword }
                  dispatch = { dispatch }
                  required
               />
               <Input
                  id = "name"
                  type = "text"
                  label = "Name"
                  autoComplete = "name"
                  icon = { faFeather }
                  input = { state.name }
                  dispatch = { dispatch }
                  required
               />
               <Input
                  id = "birthday"
                  type = "date"
                  label = "Birthday"
                  name = "bday"
                  autoComplete = "bday"
                  icon = { faCalendar }
                  input = { state.birthday }
                  dispatch = { dispatch }
                  required
               />
               <Input
                  id = "email"
                  type = "email"
                  label = "Email"
                  autoComplete = "email"
                  icon = { faEnvelope }
                  input = { state.email }
                  dispatch = { dispatch }
                  required
               />
               <Input
                  id = "phone"
                  type = "tel"
                  label = "Phone"
                  autoComplete = "tel"
                  icon = { faPhone }
                  input = { state.phone }
                  dispatch = { dispatch }
               />
               <Button
                  type = "submit"
                  className = "h-[2.6rem] bg-primary text-white"
                  icon = { faUserPlus }
               >
                  Sign Up
               </Button>
            </form>
            <p className = "mt-4 px-2">
               Already have an account?{ " " }
               <Link
                  href = "/login"
                  className = "break-words font-bold text-primary"
               >
                  Log&nbsp;In
               </Link>
            </p>
         </div>
      </div>
   );
}