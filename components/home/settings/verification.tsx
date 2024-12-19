
import clsx from "clsx";
import Modal from "@/components/global/modal";
import Button from "@/components/global/button";
import { handleResponse } from "@/lib/global/response";
import { verifyUserAttribute } from "@/lib/settings/service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formReducer, VitalityState } from "@/lib/global/state";
import { AttributeProps } from "@/components/home/settings/attribute";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { ChangeEvent, useCallback, useContext, useMemo, useReducer, useRef } from "react";

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
   },
   empty: {
      value: false,
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
      // Update verification code input and ensure empty error is removed, if any
      const [id, input] = inputs[index];

      localDispatch({
         type: "updateStates",
         value: {
            [id]: {
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
      inputs,
      localState.empty
   ]);

   const handleVerificationCode = useCallback(async() => {
      // Ensure all verification inputs are non-empty
      const codes = {
         ...Object.fromEntries(Object.values(inputs)),
         empty: {
            ...localState.empty,
            value: false
         }
      };

      for (let i = 0; i <= 3; i++) {
         const [id, input] = inputs[i];
         const isEmpty: boolean = input.value.trim() === "";

         if (isEmpty) {
            codes.empty.value = true;
         }

         codes[id] = {
            ...codes[id],
            error: isEmpty ? "\0" : null
         };
      }

      if (codes.empty.value === true) {
         localDispatch({
            type: "initializeState",
            value: codes
         });
      } else {
         handleResponse(await verifyUserAttribute(user.id, attribute), localDispatch, updateNotification, () => {
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
      globalState,
      globalDispatch,
      localState.empty,
      updateNotification
   ]);

   return (
      <Modal
         ref = { verificationModalRef }
         display = {
            <FontAwesomeIcon
               icon = { faShieldHalved }
               className = {
                  clsx("cursor-pointer pt-1 text-lg xxsm:text-xl", {
                     "text-red-500 hover:text-red-600": !input.data.verified,
                     "text-green-500 hover:text-green-600": input.data.verified
                  })
               }
            />
         }
         className = "mt-12 max-h-[90%] max-w-full sm:max-w-xl"
         disabled = { input.data.verified }
      >
         <div className = "relative flex flex-col items-center justify-center gap-4 px-1 py-2 text-center">
            <FontAwesomeIcon
               icon = { faShieldHalved }
               className = "mt-6 text-5xl text-primary"
            />
            <div className = "relative mx-auto flex items-center justify-center text-center">
               <p className = "text-sm font-bold xxsm:text-base">
                  { `A one-time verification code has been sent to your ${attribute}, please enter it below to complete the process` }
               </p>
            </div>
            <div className = "mx-auto flex w-full flex-row flex-wrap items-center justify-center gap-3">
               {
                  Array.from({ length: 4 }, (_, index) => {
                     const [id, input] = inputs[index];

                     return (
                        <div
                           className = "size-12 font-bold xsm:size-14"
                           key = { index }
                        >
                           <input
                              id = { `verification-${id}` }
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
            {
               localState.empty.value === true && (
                  <div className = "relative mx-auto flex animate-fadeIn items-center justify-center gap-2 px-2 text-center text-base opacity-0">
                     <p className = "input-error font-bold text-red-500">
                        Invalid verification code
                     </p>
                  </div>
               )
            }
            <Button
               type = "submit"
               className = "h-[2.6rem] whitespace-nowrap rounded-md bg-primary p-5 text-sm font-bold text-white hover:bg-primary/80 xxsm:text-base"
               icon = { icon }
               onClick = { handleVerificationCode }
            >
               Verify
            </Button>
            <div>
               <p className = "text-sm font-bold xxsm:text-base">
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