"use client";
import { faArrowRotateLeft, faAt, faCakeCandles, faDoorOpen, faKey, faPhone, faSignature, faUserPlus, faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useCallback, useContext, useReducer, useRef } from "react";

import { NotificationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Heading from "@/components/global/heading";
import { Input } from "@/components/global/input";
import { login } from "@/lib/authentication/login";
import { Registration, signup } from "@/lib/authentication/signup";
import { formReducer, VitalityState } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";

const form: VitalityState = {
   username: {
      id: "username",
      value: "",
      error: null
   },
   password: {
      id: "password",
      value: "",
      error: null
   },
   confirmPassword: {
      id: "confirmPassword",
      value: "",
      error: null
   },
   name: {
      id: "name",
      value: "",
      error: null
   },
   birthday: {
      id: "birthday",
      value: "",
      error: null
   },
   email: {
      id: "email",
      value: "",
      error: null
   },
   phone: {
      id: "phone",
      value: "",
      error: null
   }
};

export default function SignUp(): JSX.Element {
   const { updateNotifications } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, form);
   const signupButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const register = useCallback(async() => {
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

      processResponse(response, dispatch, updateNotifications, () => {
         // Display notification with login button for redirection
         updateNotifications({
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
   }, [
      state.name,
      state.username,
      state.password,
      state.confirmPassword,
      state.email,
      state.birthday,
      state.phone,
      updateNotifications
   ]);

   const submitRegistration = useCallback(() => {
      signupButtonRef.current?.submit();
   }, []);

   return (
      <div className = "mx-auto mb-12 flex w-full flex-col items-center justify-center text-center">
         <Heading
            title = "Sign Up"
            message = "Create an account to get started"
         />
         <div className = "mx-auto mt-12 w-11/12 sm:w-3/4 xl:w-5/12">
            <form className = "relative mx-auto flex w-full flex-col items-stretch justify-center gap-3">
               <FontAwesomeIcon
                  icon = { faArrowRotateLeft }
                  onClick = {
                     () =>
                        dispatch({
                           type: "resetState",
                           value: form
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
                  onSubmit = { submitRegistration }
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
                  onSubmit = { submitRegistration }
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
                  onSubmit = { submitRegistration }
                  required
               />
               <Input
                  id = "name"
                  type = "text"
                  label = "Name"
                  autoComplete = "name"
                  icon = { faSignature }
                  input = { state.name }
                  dispatch = { dispatch }
                  onSubmit = { submitRegistration }
                  required
               />
               <Input
                  id = "birthday"
                  type = "date"
                  label = "Birthday"
                  name = "bday"
                  autoComplete = "bday"
                  icon = { faCakeCandles }
                  input = { state.birthday }
                  dispatch = { dispatch }
                  onSubmit = { submitRegistration }
                  required
               />
               <Input
                  id = "email"
                  type = "email"
                  label = "Email"
                  autoComplete = "email"
                  icon = { faAt }
                  input = { state.email }
                  dispatch = { dispatch }
                  onSubmit = { submitRegistration }
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
                  onSubmit = { submitRegistration }
               />
               <Button
                  ref = { signupButtonRef }
                  type = "submit"
                  className = "h-[2.6rem] bg-primary text-white"
                  icon = { faUserPlus }
                  onSubmit = { register }
                  onClick = { submitRegistration }
                  isSingleSubmission = { true }
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