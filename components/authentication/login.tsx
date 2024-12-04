"use client";
import Link from "next/link";
import Heading from "@/components/global/heading";
import Button from "@/components/global/button";
import { Input } from "@/components/global/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useContext, useReducer } from "react";
import { login, Credentials } from "@/lib/authentication/login";
import { VitalityState, formReducer } from "@/lib/global/state";
import { handleResponse } from "@/lib/global/response";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { faArrowRotateLeft, faKey, faUnlockKeyhole, faUserSecret } from "@fortawesome/free-solid-svg-icons";

const credentials: VitalityState = {
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
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const [state, dispatch] = useReducer(formReducer, credentials);

   if (user !== undefined) {
      // Reload the window to ensure the Next.js routing is updated correctly
      window.location.reload();
   }

   const handleAuthenticate = async(event: FormEvent) => {
      event.preventDefault();

      const credentials: Credentials = {
         username: state.username.value.trim(),
         password: state.password.value.trim()
      };

      handleResponse(await login(credentials), dispatch, updateNotification, () => {
         window.location.reload();
      });
   };

   return (
      <div className = "mx-auto flex w-full flex-col items-center justify-center text-center">
         <Heading
            title = "Log In"
            description = "Enter valid credentials to enter"
         />
         <div className = "mx-auto mt-8 w-11/12 sm:w-3/4 xl:w-5/12">
            <form
               className = "relative flex w-full flex-col items-stretch justify-center gap-3"
               onSubmit = { handleAuthenticate }
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
                  autoComplete = "none"
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
                  autoComplete = "current-password"
                  icon = { faKey }
                  input = { state.password }
                  dispatch = { dispatch }
                  required
               />
               <Button
                  type = "submit"
                  className = "h-[2.6rem] bg-primary text-white"
                  icon = { faUnlockKeyhole }
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