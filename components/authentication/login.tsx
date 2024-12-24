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
import { handleResponse } from "@/lib/global/response";
import { formReducer, VitalityState } from "@/lib/global/reducer";

const form: VitalityState = {
   username: {
      value: "",
      error: null,
      data: {}
   },
   password: {
      value: "",
      error: null,
      data: {}
   }
};

export default function Login(): JSX.Element {
   const { updateNotifications } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, form);
   const loginButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const handleAuthenticate = useCallback(async() => {
      const credentials: Credentials = {
         username: state.username.value.trim(),
         password: state.password.value.trim()
      };

      handleResponse(await login(credentials), dispatch, updateNotifications, () => {
         window.location.reload();
      });
   }, [
      state.username,
      state.password,
      updateNotifications
   ]);

   const handleSubmitAuthentication = useCallback(() => {
      loginButtonRef.current?.submit();
   }, []);

   return (
      <div className = "mx-auto mb-12 flex w-full flex-col items-center justify-center text-center">
         <Heading
            title = "Log In"
            message = "Enter valid credentials to enter"
         />
         <div className = "mx-auto mt-8 w-11/12 sm:w-3/4 xl:w-5/12">
            <div className = "relative flex w-full flex-col items-stretch justify-center gap-3">
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
                  onSubmit = { handleSubmitAuthentication }
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
                  onSubmit = { handleSubmitAuthentication }
                  required
               />
               <Button
                  ref = { loginButtonRef }
                  type = "submit"
                  className = "h-[2.6rem] bg-primary text-white"
                  icon = { faUnlockKeyhole }
                  onSubmit = { handleAuthenticate }
                  onClick = { handleSubmitAuthentication }
                  isSingleSubmission = { true }
               >
                  Log In
               </Button>
            </div>
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