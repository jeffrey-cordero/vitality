import { faArrowRotateLeft, faKey, faPenToSquare, faRightFromBracket, faTrashCan, faXmark, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useRef, useState } from "react";
import { useDoubleTap } from "use-double-tap";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Button from "@/components/global/button";
import Confirmation from "@/components/global/confirmation";
import { Input } from "@/components/global/input";
import { VitalityInputProps } from "@/components/global/input";
import Modal from "@/components/global/modal";
import VerifyAttribute from "@/components/home/settings/verification";
import { normalizeDate } from "@/lib/authentication/shared";
import { VitalityProps } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { updateAttribute, updatePassword, updatePreference } from "@/lib/home/settings/settings";

interface AttributeContainerProps {
   icon: IconDefinition;
   label: string;
   controller: React.ReactNode;
   doubleTapMethod?: () => void;
}

function AttributeContainer(props: AttributeContainerProps): JSX.Element {
   const { icon, label, controller, doubleTapMethod } = props;
   const doubleTap = useDoubleTap(doubleTapMethod);

   return (
      <div className = "relative mx-auto w-full">
         <div className = "flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
            <div
               className = "flex cursor-pointer flex-col items-center justify-center gap-4 sm:flex-row"
               { ...doubleTap }
            >
               <FontAwesomeIcon
                  icon = { icon }
                  className = "w-8 text-xl text-primary xxsm:text-2xl"
               />
               <h2 className = "max-w-full text-center text-base font-semibold [overflow-wrap:anywhere] xxsm:text-[17.6px] sm:text-left">
                  { label }
               </h2>

            </div>
            <div className = "relative">
               { controller }
            </div>
         </div>
      </div>
   );
}

export interface AttributeProps extends VitalityProps, VitalityInputProps {}

export function GeneralAttribute(props: AttributeProps) {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { id, input, type, icon, globalDispatch } = props;
   const [isEditing, setIsEditing] = useState<boolean>(false);
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);
   const isUniqueAttribute: boolean = id === "username" || id === "email" || id === "phone";

   const resetInput = useCallback(() => {
      // Prevent resetting the form state during a submission
      if (document.getElementById(id)?.getAttribute("disabled") === "true") return;

      globalDispatch({
         type: "updateState",
         value: {
            id: id,
            value: {
               value: "",
               error: null
            }
         }
      });
   }, [
      id,
      globalDispatch
   ]);

   const submitUpdateAttribute = useCallback(async() => {
      const updatingValue: Date | string = type === "date" ? new Date(input.value) : input.value.trim();
      const updatingStored: string = type === "date" ? normalizeDate(new Date(input.value)) : input.value.trim();

      if (input.data?.stored === updatingStored) {
         // No changes to current user attribute
         return;
      }

      const response: VitalityResponse<boolean> = await updateAttribute(user.id, id as any, updatingValue);

      processResponse(response, globalDispatch, updateNotifications, async() => {
         // Determine if the attribute was updated (may not occur for normalizing attributes)
         const updates: boolean = response.body.data;

         globalDispatch({
            type: "updateState",
            value: {
               id: id,
               value: {
                  data: {
                     valid: id === "image" ? true : undefined,
                     verified: id === "email" || id === "phone" ? updates !== null ? false : input.data?.verified : undefined,
                     stored: updatingStored
                  }
               }
            }
         });

         isUniqueAttribute && updateNotifications({
            status: response.status,
            message: response.body.message,
            timer: 1500
         });

         setIsEditing(false);
      });
   }, [
      id,
      user,
      type,
      input,
      globalDispatch,
      isUniqueAttribute,
      updateNotifications
   ]);

   const submitPasswordUpdates = useCallback(() => {
      updateButtonRef.current?.submit();
   }, []);

   return (
      <div className = "relative mx-auto w-full">
         {
            isEditing ? (
               <div className = "relative mt-8">
                  <FontAwesomeIcon
                     icon = { faArrowRotateLeft }
                     className = "absolute right-[2.1875rem] top-[-1.5625rem] z-10 cursor-pointer text-base text-primary"
                     onClick = { resetInput }
                  />
                  <FontAwesomeIcon
                     icon = { faXmark }
                     className = "absolute right-[.625rem] top-[-1.6875rem] z-10 cursor-pointer text-xl text-red-500"
                     onClick = {
                        () => {
                        // Prevent closing the input during a submission
                           if (document.getElementById(id)?.getAttribute("disabled") === "true") return;

                           setIsEditing(false);
                        }
                     }
                  />
                  <Input
                     { ...props }
                     id = { id }
                     onSubmit = { submitPasswordUpdates }
                     onBlur = { undefined }
                     autoComplete = { id }
                  />
                  <Button
                     ref = { updateButtonRef }
                     type = "submit"
                     className = "mt-3 h-10 w-full bg-primary text-white"
                     icon = { icon }
                     onClick = { submitPasswordUpdates }
                     onSubmit = { submitUpdateAttribute }
                     isSingleSubmission = { true }
                     inputIds = { [id] }
                  >
                     Update
                  </Button>
               </div>
            ) : (
               <AttributeContainer
                  icon = { icon }
                  label = { input.data?.stored || "Missing" }
                  controller = {
                     <div className = "flex flex-row items-center justify-center gap-3">
                        {
                           input.data?.verified !== undefined && input.data?.stored !== "" && (
                              <VerifyAttribute
                                 { ...props }
                                 attribute = { id === "email" ? "email" : "phone" }
                              />
                           )
                        }
                        <FontAwesomeIcon
                           icon = { faPenToSquare }
                           className = "cursor-pointer text-lg text-primary hover:text-primary/80 xxsm:text-xl"
                           onClick = { () => setIsEditing(true) }
                        />
                     </div>
                  }
                  doubleTapMethod = { () => setIsEditing(true) }
               />
            )
         }
      </div>
   );
}

export function PasswordAttribute(props: VitalityProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { globalState, globalDispatch } = props;
   const passwordModalRef = useRef<{ open: () => void; close: () => void; isOpen: () => boolean }>(null);
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const submitUpdatePassword = useCallback(async() => {
      const response: VitalityResponse<boolean> = await updatePassword(
         user.id,
         globalState.oldPassword.value.trim(),
         globalState.newPassword.value.trim(),
         globalState.confirmPassword.value.trim()
      );

      processResponse(response, globalDispatch, updateNotifications, () => {
         updateNotifications({
            status: response.status,
            message: response.body.message,
            timer: 1500
         });

         // Reset password form inputs for future submissions
         globalDispatch({
            type: "updateStates",
            value: {
               oldPassword: {
                  value: "",
                  error: null
               },
               newPassword: {
                  value: "",
                  error: null
               },
               confirmPassword: {
                  value: "",
                  error: null
               }
            }
         });

         passwordModalRef.current?.close();
      });
   }, [
      user,
      globalDispatch,
      updateNotifications,
      globalState.oldPassword,
      globalState.newPassword,
      globalState.confirmPassword
   ]);

   const submitPasswordUpdates = useCallback(() => {
      updateButtonRef.current?.submit();
   }, []);

   return (
      <AttributeContainer
         icon = { faKey }
         label = { "********" }
         controller = {
            <Modal
               ref = { passwordModalRef }
               display = {
                  <FontAwesomeIcon
                     icon = { faPenToSquare }
                     className = "cursor-pointer text-lg text-primary hover:text-primary/80 xxsm:text-xl"
                  />
               }
               className = "mt-12 max-h-[90%] max-w-full sm:max-w-xl"
            >
               <div className = "relative flex flex-col items-center justify-center gap-6 pb-2 text-center">
                  <FontAwesomeIcon
                     icon = { faKey }
                     className = "mt-6 text-5xl text-primary"
                  />
                  <div className = "relative mx-auto flex items-center justify-center text-center">
                     <p className = "px-1 text-sm font-bold xxsm:text-base">
                        Please enter your old password, followed by your new password and confirmation to update your credentials
                     </p>
                  </div>
                  <div
                     className = "mx-auto flex w-full flex-col items-stretch justify-center gap-3"
                     aria-label = "Change Password"
                  >
                     <Input
                        id = "oldPassword"
                        type = "password"
                        label = "Current Password"
                        icon = { faKey }
                        input = { globalState.oldPassword }
                        dispatch = { globalDispatch }
                        onSubmit = { submitPasswordUpdates }
                        autoComplete = "current-password"
                     />
                     <Input
                        id = "newPassword"
                        type = "password"
                        label = "New Password"
                        icon = { faKey }
                        input = { globalState.newPassword }
                        dispatch = { globalDispatch }
                        onSubmit = { submitPasswordUpdates }
                        autoComplete = "new-password"
                     />
                     <Input
                        id = "confirmPassword"
                        type = "password"
                        label = "Confirm Password"
                        icon = { faKey }
                        input = { globalState.confirmPassword }
                        dispatch = { globalDispatch }
                        onSubmit = { submitPasswordUpdates }
                        autoComplete = "new-password"
                     />
                     <Button
                        ref = { updateButtonRef }
                        type = "submit"
                        className = "h-[41.6px] whitespace-nowrap rounded-md bg-primary p-5 text-sm font-bold text-white xxsm:text-base"
                        icon = { faKey }
                        onSubmit = { submitUpdatePassword }
                        onClick = { submitPasswordUpdates }
                        isSingleSubmission = { true }
                        inputIds = { ["oldPassword", "newPassword", "confirmPassword"] }
                     >
                        Update
                     </Button>
                  </div>
               </div>
            </Modal>
         }
         doubleTapMethod = { () => passwordModalRef.current?.open() }
      />
   );
}

interface SliderProps extends VitalityProps {
   id: "mail" | "sms";
   label: string;
   icon: IconDefinition;
   onChange: () => void;
   checked: boolean;
}

export function SliderAttribute(props: SliderProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { id, icon, label, onChange, checked, globalDispatch } = props;

   const submitUpdatePreference = useCallback(async() => {
      processResponse(await updatePreference(user.id, id, !checked), globalDispatch, updateNotifications, () => {
         globalDispatch({
            type: "updateState",
            value: {
               id: id,
               value: {
                  value: !checked
               }
            }
         });
      });
   }, [
      id,
      user,
      checked,
      globalDispatch,
      updateNotifications
   ]);

   return (
      <AttributeContainer
         icon = { icon }
         label = { label }
         controller = {
            <label className = "inline-flex cursor-pointer items-center">
               <input
                  id = { id ?? "darkMode" }
                  type = "checkbox"
                  value = ""
                  className = "peer sr-only"
                  onChange = { onChange ?? submitUpdatePreference }
                  checked = { checked }
               />
               <div className = "peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[.125rem] after:top-[.125rem] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/60 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary/60"></div>
            </label>
         }
      />
   );
}

interface AccountActionProps extends VitalityProps {
   action: "delete" | "session";
   message: string;
   icon: IconDefinition;
   label: string;
   onConfirmation: () => Promise<void>;
}

export function AccountAction(props: AccountActionProps): JSX.Element {
   const { action, label, message, icon, onConfirmation } = props;

   return (
      <AttributeContainer
         icon = { icon }
         label = { label }
         controller = {
            <Confirmation
               message = { message }
               onConfirmation = { onConfirmation }
               display = {
                  <FontAwesomeIcon
                     icon = { action === "delete" ? faTrashCan : faRightFromBracket }
                     className = "cursor-pointer text-lg text-red-500 xxsm:text-xl"
                  />
               }
            />
         }
      />
   );
}