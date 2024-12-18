
import Modal from "@/components/global/modal";
import Button from "@/components/global/button";
import { useDoubleTap } from "use-double-tap";
import { Input } from "@/components/global/input";
import { handleResponse } from "@/lib/global/response";
import { verifyAttribute } from "@/lib/settings/service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VitalityInputProps } from "@/components/global/input";
import { formReducer, VitalityProps, VitalityState } from "@/lib/global/state";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { ChangeEvent, useCallback, useContext, useMemo, useReducer, useRef, useState } from "react";
import { faShield, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { AttributeProps } from "./attribute";
import clsx from "clsx";

const verification: VitalityState = {
   first: {
      value: "",
      error: null,
      data: {
         id: "first"
      }
   },
   second: {
      value: "",
      error: null,
      data: {}
   },
   third: {
      value: "",
      error: null,
      data: {}
   },
   fourth: {
      value: "",
      error: null,
      data: {}
   }
};

interface VerifyAttributeProps extends AttributeProps {
   attribute: "email" | "phone";
}

export default function VerifyAttribute(props: VerifyAttributeProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const { attribute, input, icon, globalState, globalDispatch } = props;
   const [localState, localDispatch] = useReducer(formReducer, verification);
   const verificationModalRef = useRef<{ open: () => void; close: () => void }>(null);

   const inputs = useMemo(() => ({
      0: ["first", localState.first],
      1: ["second", localState.second],
      2: ["third", localState.third],
      3: ["fourth", localState.fourth]
   }), [
      localState.first,
      localState.second,
      localState.third,
      localState.fourth
   ]);

   const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>, index: number) => {
      const [id, input] = inputs[index];

      localDispatch({
         type: "updateState",
         value: {
            id: id,
            input: {
               ...input,
               value: event.target.value,
               error: null
            }
         }
      });
   }, [inputs]);

   const handleVerificationCode = useCallback(async() => {
      // Ensure all verification inputs are non-empty
      let containsEmptyInput: boolean = false;
      const codes = Object.fromEntries(Object.values(inputs));

      for (let i = 0; i <= 3; i++) {
         const [id, input] = inputs[i];
         const isEmpty: boolean = input.value.trim() === "";

         if (isEmpty) {
            containsEmptyInput = true;
         }

         codes[id] = {
            ...input,
            error: isEmpty ? "\0" : null
         };
      }

      if (containsEmptyInput) {
         localDispatch({
            type: "initializeState",
            value: codes
         });
      } else {
         handleResponse(await verifyAttribute(user.id, attribute), localDispatch, updateNotification, () => {
            globalDispatch({
               type: "updateState",
               value: {
                  id: attribute,
                  input: {
                     ...globalState[attribute],
                     data: {
                        ...globalState[attribute].data,
                        verified: true
                     }
                  }
               }
            });
   
            updateNotification({
               status: "Success",
               message: `Successful ${attribute === "phone" ? "phone number" : "email"} verification`,
               timer: 1500
            });
   
            verificationModalRef.current?.close();
         });
      }
   }, [
      user,
      inputs,
      attribute,
      globalDispatch,
      globalState,
      updateNotification
   ]);

   return (
      <Modal
         ref = { verificationModalRef }
         display = {
            <div className = "relative">
               <FontAwesomeIcon
                  icon = { input.data.verified ? faShield : faShieldHalved }
                  className = {
                     clsx("cursor-pointer text-lg", {
                        "text-red-500": !input.data.verified,
                        "text-green-500": input.data.verified
                     })
                  }
               />
            </div>
         }
         className = "mt-12 max-h-[90%] max-w-full sm:max-w-xl"
         disabled = { input.data.verified }
      >
         <div className = "relative flex flex-col items-center justify-center gap-4 text-center">
            <FontAwesomeIcon
               icon = { icon }
               className = "mt-6 text-4xl text-primary"
            />
            <div className = "relative mx-auto flex items-center justify-center text-center">
               <p className = "font-semibold">
                  { `A one-time verification code has been sent to your ${attribute}, please enter it below to complete the process` }
               </p>
            </div>
            <div className = "mx-auto flex w-full flex-row items-center justify-center gap-3">
               {
                  Array.from({ length: 4 }, (_, index) => {
                     const [__, input] = inputs[index];

                     return (
                        <div
                           className = "size-10 font-bold xxsm:size-12 xsm:size-14"
                           key = { index }
                        >
                           <input
                              id = { `verification-${index}` }
                              className = {
                                 clsx("flex size-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-2 text-center text-lg outline-none focus:border-[1.5px] focus:border-primary dark:border-0 dark:bg-gray-700/50", {
                                    "border-red-500 border-2 dark:border-2 focus:border-red-500 focus:ring-red-500 error" : input.error === "\0"
                                 })
                              }
                              onChange = { (event: ChangeEvent<HTMLInputElement>) => handleInputChange(event, index) }
                              type = "text"
                              maxLength = { 1 }
                              onKeyDown = { (event: React.KeyboardEvent<HTMLInputElement>) => event.key === "Enter" && handleVerificationCode() }
                           />
                        </div>
                     );
                  })
               }
            </div>
            <Button
               type = "submit"
               className = "h-[2.6rem] whitespace-nowrap rounded-md bg-primary p-5 text-sm font-bold text-white xxsm:text-base"
               icon = { faShield }
               onClick = { handleVerificationCode }
            >
               Verify
            </Button>
            <div>
               <p className = "font-semibold">
                  Didn&apos;t receive code?{ " " }
                  <span
                     onClick = {
                        () => {
                           updateNotification({
                              status: "Success",
                              message: "One-time verification code has been resent",
                              timer: 1500
                           });
                        }
                     }
                     className = "cursor-pointer break-words font-bold text-primary"
                  >
                     Resend
                  </span>
               </p>
            </div>
         </div>
      </Modal>
   );
}