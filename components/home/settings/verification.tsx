
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ChangeEvent, useCallback, useContext, useReducer, useRef } from "react";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Error from "@/components/global/error";
import Modal from "@/components/global/modal";
import { AttributeProps } from "@/components/home/settings/attribute";
import { formReducer, VitalityState } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { verifyAttribute } from "@/lib/home/settings/settings";

const form: VitalityState = {
   0: {
      id: "0",
      value: "",
      error: null
   },
   1: {
      id: "1",
      value: "",
      error: null
   },
   2: {
      id: "2",
      value: "",
      error: null
   },
   3: {
      id: "3",
      value: "",
      error: null
   },
   empty: {
      id: "empty",
      value: false,
      error: null
   }
};

interface VerifyAttributeProps extends AttributeProps {
   attribute: "email" | "phone";
}

export default function VerifyAttribute(props: VerifyAttributeProps): JSX.Element {
   // Mock verification component for email and phone until actual verification is implemented during deployment stage
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { attribute, input, icon, globalDispatch } = props;
   const [localState, localDispatch] = useReducer(formReducer, form);
   const verificationModalRef = useRef<{ open: () => void; close: () => void; isOpen: () => boolean }>(null);
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const updateVerificationInput = useCallback((event: ChangeEvent<HTMLInputElement>, index: number) => {
      // Update verification code input and remove the potential empty error, if applicable
      localDispatch({
         type: "updateStates",
         value: {
            [index]: {
               ...input,
               value: event.target.value,
               error: null
            },
            empty: {
               ...localState.empty,
               value: false
            }
         }
      });
   }, [
      input,
      localState.empty
   ]);

   const submitVerificationCode = useCallback(async() => {
      // Ensure non-empty verification inputs
      const codes = {
         ...localState,
         empty: {
            ...localState.empty,
            value: false
         }
      };

      for (let i = 0; i <= 3; i++) {
         // All verification inputs must be non-empty
         const value: string = localState[i].value;
         const isEmpty: boolean = value.trim() === "";

         if (isEmpty) {
            codes.empty.value = true;
         }

         codes[i] = {
            value: value,
            error: isEmpty ? "\0" : null
         };
      }

      if (!codes.empty.value) {
         const response: VitalityResponse<boolean> = await verifyAttribute(user.id, `${attribute}_verified`);

         processResponse(response, localDispatch, updateNotifications, () => {
            globalDispatch({
               type: "updateState",
               value: {
                  id: attribute,
                  value: {
                     data: {
                        verified: true
                     }
                  }
               }
            });

            updateNotifications({
               status: response.status,
               message: response.body.message,
               timer: 1500
            });

            verificationModalRef.current?.close();
         });
      } else {
         localDispatch({
            type: "updateStates",
            value: codes
         });
      }
   }, [
      user,
      attribute,
      localState,
      globalDispatch,
      updateNotifications
   ]);

   const handleSubmitUpdates = useCallback(() => {
      updateButtonRef.current?.submit();
   }, []);

   return (
      <Modal
         ref = { verificationModalRef }
         display = {
            <FontAwesomeIcon
               icon = { faShieldHalved }
               className = {
                  clsx("cursor-pointer pt-1 text-lg xxsm:text-xl", {
                     "text-red-500 hover:text-red-600": !input.data?.verified,
                     "text-green-500 hover:text-green-600": input.data?.verified
                  })
               }
            />
         }
         className = "mt-12 max-h-[90%] max-w-full sm:max-w-xl"
         disabled = { input.data?.verified }
      >
         <div className = "relative flex flex-col items-center justify-center gap-4 py-2 text-center">
            <FontAwesomeIcon
               icon = { faShieldHalved }
               className = "mt-6 text-5xl text-primary"
            />
            <div className = "relative mx-auto flex items-center justify-center text-center">
               <p className = "px-1 text-sm font-bold xxsm:text-base">
                  { `A one-time verification code has been sent to your ${attribute}, please enter it below to complete the process` }
               </p>
            </div>
            <div className = "mx-auto flex w-full flex-row flex-wrap items-center justify-center gap-3">
               {
                  Array.from({ length: 4 }, (_, index) => {
                     const input = localState[index];

                     return (
                        <div
                           className = "size-12 font-bold xsm:size-14"
                           key = { index }
                        >
                           <input
                              id = { `verification-${index}` }
                              className = {
                                 clsx("flex size-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-2 text-center text-lg outline-none focus:border-[1.5px] focus:border-primary dark:border-0 dark:bg-gray-700/50 disabled:pointer-events-none disabled:opacity-50", {
                                    "border-red-500 border-2 dark:border-2 focus:border-red-500 focus:ring-red-500 error" : input.error === "\0"
                                 })
                              }
                              onChange = { (event: ChangeEvent<HTMLInputElement>) => updateVerificationInput(event, index) }
                              type = "text"
                              maxLength = { 1 }
                              onKeyDown = { (event: React.KeyboardEvent<HTMLInputElement>) => event.key === "Enter" && handleSubmitUpdates() }
                           />
                        </div>
                     );
                  })
               }
            </div>
            <Error
               className = "my-0"
               message = { localState.empty.value ? "Invalid verification code" : null }
            />
            <Button
               ref = { updateButtonRef }
               type = "submit"
               className = "h-[2.6rem] whitespace-nowrap rounded-md bg-primary p-5 text-sm font-bold text-white hover:bg-primary/80 xxsm:text-base"
               icon = { icon }
               onSubmit = { submitVerificationCode }
               onClick = { handleSubmitUpdates }
               isSingleSubmission = { true }
               inputIds={ ["verification-0", "verification-1", "verification-2", "verification-3"] }
            >
               Verify
            </Button>
            <div>
               <p className = "text-sm font-bold xxsm:text-base">
                  Didn&apos;t receive code?{ " " }
                  <span
                     onClick = {
                        () => {
                           updateNotifications({
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