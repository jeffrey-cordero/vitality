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
import { VitalityProps } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { updateAttribute, updatePassword, updatePreference } from "@/lib/home/settings/service";

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
         <div className = "my-4 flex flex-col items-center justify-center gap-3 xsm:my-1 xsm:flex-row xsm:justify-between">
            <div
               className = "flex flex-col items-center justify-center gap-2 xsm:flex-row"
               { ...doubleTap }
            >
               <FontAwesomeIcon
                  icon = { icon }
                  className = "w-8 text-lg text-primary xxsm:text-xl"
               />
               <h2 className = "max-w-[30rem] whitespace-pre-wrap text-center text-base font-semibold [overflow-wrap:anywhere] xxsm:text-[1.1rem]">
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

export interface AttributeProps extends VitalityProps, VitalityInputProps {
   editOnly?: boolean;
}

export function GeneralAttribute(props: AttributeProps) {
   const { user } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const { id, input, type, icon, editOnly, onBlur, globalDispatch } = props;
   const [isEditing, setIsEditing] = useState<boolean>(editOnly ?? false);
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);
   const isUniqueAttribute: boolean = id === "username" || id === "email" || id === "phone";

   const handleResetInput = useCallback(() => {
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

   const handleUpdateAttribute = useCallback(async() => {
      const updatingValue: Date | string = type === "date"
         ? new Date(input.value) : input.value.trim();
      const updatingStored: string = type === "date" ?
         new Date(input.value)?.toISOString().slice(0, 10).replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1") : input.value.trim();

      if (input.data?.stored === updatingStored) {
         // No changes applied to current user attribute
         return;
      }

      const response: VitalityResponse<void> = await updateAttribute(user.id, id as any, updatingValue);

      processResponse(response, globalDispatch, updateNotifications, async() => {
         globalDispatch({
            type: "updateState",
            value: {
               id: id,
               value: {
                  data: {
                     valid: id === "image" ? true : undefined,
                     verified: id === "email" || id === "phone" ? false : undefined,
                     stored: updatingStored
                  }
               }
            }
         });

         if (isUniqueAttribute) {
            editOnly ? onBlur(null) : setIsEditing(false);

            updateNotifications({
               status: response.status,
               message: response.body.message,
               timer: 1500
            });
         }
      });
   }, [
      id,
      user,
      globalDispatch,
      isUniqueAttribute,
      input,
      type,
      editOnly,
      onBlur,
      updateNotifications
   ]);

   const handleSubmitUpdates = useCallback(() => {
      updateButtonRef.current?.submit();
   }, []);

   return (
      <div className = "relative mx-auto w-full">
         {
            (isEditing || editOnly) ? (
               <div className = "relative mt-8">
                  <FontAwesomeIcon
                     icon = { faArrowRotateLeft }
                     className = "absolute right-[35px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-primary"
                     onClick = { handleResetInput }
                  />
                  <FontAwesomeIcon
                     icon = { faXmark }
                     className = "absolute right-[10px] top-[-27px] z-10 size-4 shrink-0 cursor-pointer text-lg text-red-500 xxsm:text-xl"
                     onClick = { () => { editOnly ? onBlur(null) : setIsEditing(false); } }
                  />
                  <Input
                     { ...props }
                     onSubmit = { handleSubmitUpdates }
                     onBlur = { undefined }
                     autoComplete = { id }
                  />
                  <Button
                     ref = { updateButtonRef }
                     type = "submit"
                     className = "mt-2 h-10 w-full bg-primary text-white"
                     icon = { icon }
                     onClick = { handleSubmitUpdates }
                     onSubmit = { handleUpdateAttribute }
                     isSingleSubmission = { isUniqueAttribute ? true : undefined }
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
                           input.data?.verified !== undefined && input.value.trim() !== "" && (
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

   const handleUpdatePassword = useCallback(async() => {
      const response: VitalityResponse<void> = await updatePassword(
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

         // Reset password form inputs
         globalDispatch({
            type: "updateStates",
            value: {
               oldPassword: {
                  ...globalState.oldPassword,
                  value: "",
                  error: null
               },
               newPassword: {
                  ...globalState.newPassword,
                  value: "",
                  error: null
               },
               confirmPassword: {
                  ...globalState.confirmPassword,
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

   const handleSubmitUpdates = useCallback(() => {
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
               <div className = "relative flex flex-col items-center justify-center gap-6 py-2 text-center">
                  <FontAwesomeIcon
                     icon = { faKey }
                     className = "mt-6 text-5xl text-primary"
                  />
                  <div className = "relative mx-auto flex items-center justify-center text-center">
                     <p className = "text-sm font-bold xxsm:text-base">
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
                        onSubmit = { handleSubmitUpdates }
                        autoComplete = "current-password"
                     />
                     <Input
                        id = "newPassword"
                        type = "password"
                        label = "New Password"
                        icon = { faKey }
                        input = { globalState.newPassword }
                        dispatch = { globalDispatch }
                        onSubmit = { handleSubmitUpdates }
                        autoComplete = "new-password"
                     />
                     <Input
                        id = "confirmPassword"
                        type = "password"
                        label = "Confirm Password"
                        icon = { faKey }
                        input = { globalState.confirmPassword }
                        dispatch = { globalDispatch }
                        onSubmit = { handleSubmitUpdates }
                        autoComplete = "new-password"
                     />
                     <Button
                        ref = { updateButtonRef }
                        type = "submit"
                        className = "h-[2.6rem] whitespace-nowrap rounded-md bg-primary p-5 text-sm font-bold text-white xxsm:text-base"
                        icon = { faKey }
                        onSubmit = { handleUpdatePassword }
                        onClick = { handleSubmitUpdates }
                        isSingleSubmission = { true }
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

   const handleUpdatePreference = useCallback(async() => {
      const response: VitalityResponse<void> = await updatePreference(user.id, id, !checked);

      processResponse(response, globalDispatch, updateNotifications, () => {
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
                  onChange = { onChange ?? handleUpdatePreference }
                  checked = { checked }
               />
               <div className = "peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/60 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary/60"></div>
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