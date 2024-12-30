"use client";
import { faArrowRotateLeft, faKey, faUnlockKeyhole, faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useCallback, useContext, useReducer, useRef } from "react";

import { NotificationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Heading from "@/components/global/heading";
import { Input } from "@/components/global/input";
import { Credentials, login } from "@/lib/authentication/login";
import { formReducer, VitalityState } from "@/lib/global/reducer";
import { processResponse } from "@/lib/global/response";

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
   }
};

export default function Login(): JSX.Element {
   const { updateNotifications } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, form);
   const loginButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const authenticate = useCallback(async() => {
      const credentials: Credentials = {
         username: state.username.value.trim(),
         password: state.password.value.trim()
      };

      processResponse(await login(credentials), dispatch, updateNotifications, () => {
         window.location.reload();
      });
   }, [
      state.username,
      state.password,
      updateNotifications
   ]);

   const submitAuthentication = useCallback(() => {
      loginButtonRef.current?.submit();
   }, []);

   return (
      <div className = "mx-auto mb-12 flex w-full flex-col items-center justify-center text-center">
         <Heading
            title = "Log In"
            message = "Enter valid credentials to enter"
         />
         <div className = "mx-auto mt-12 w-11/12 sm:w-3/4 lg:w-7/12 2xl:w-5/12">
            <form className = "relative flex w-full flex-col items-stretch justify-center gap-3">
               <FontAwesomeIcon
                  icon = { faArrowRotateLeft }
                  onClick = {
                     () => {
                        dispatch({
                           type: "resetState",
                           value: form
                        });
                     }
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
                  onSubmit = { submitAuthentication }
                  autoFocus
                  required
               />
               <Input
                  id = "password"
                  type = "password"
                  label = "Password"
                  autoComplete = "current-password"
                  icon = { faKey }
                  input = { state.password }
                  dispatch = { dispatch }
                  onSubmit = { submitAuthentication }
                  required
               />
               <Button
                  ref = { loginButtonRef }
                  type = "button"
                  className = "h-[2.6rem] bg-primary text-white"
                  icon = { faUnlockKeyhole }
                  onSubmit = { authenticate }
                  onClick = { submitAuthentication }
                  isSingleSubmission = { true }
                  inputIds = { ["username", "password"] }
               >
                  Log In
               </Button>
            </form>
            <p className = "mt-4 px-2">
               Don&apos;t have an account? { " " }
               <Link
                  href = "/signup"
                  className = "font-bold text-primary"
               >
                  Sign&nbsp;Up
               </Link>
            </p>
         </div>
      </div>
   );
}