import Modal from "@/components/global/modal";
import Button from "@/components/global/button";
import VerifyAttribute from "@/components/home/settings/verification";
import { useDoubleTap } from "use-double-tap";
import { Input } from "@/components/global/input";
import { handleResponse } from "@/lib/global/response";
import { updateUserAttribute, updateUserPassword, updateUserPreference } from "@/lib/settings/service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VitalityInputProps } from "@/components/global/input";
import { VitalityProps } from "@/lib/global/state";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { useCallback, useContext, useRef, useState } from "react";
import { faArrowRotateLeft, faXmark, faKey, IconDefinition, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export interface AttributeProps extends VitalityProps, VitalityInputProps {
   editOnly?: boolean;
}

export function GeneralAttribute(props: AttributeProps) {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const { id, input, type, icon, editOnly, onBlur, globalDispatch } = props;
   const [isEditing, setIsEditing] = useState<boolean>(editOnly ?? false);

   const handleResetInput = useCallback(() => {
      globalDispatch({
         type: "updateState",
         value: {
            id: id,
            input: {
               ...input,
               value: "",
               error: null
            }
         }
      });
   }, [
      id,
      input,
      globalDispatch
   ]);

   const handleupdateUserAttribute = useCallback(async() => {
      const updatingDatabaseValue: Date | string = type === "date"
         ? new Date(input.value) : input.value.trim();
      const updatingStorageValue: string = type === "date" ?
         new Date(input.value).toISOString().slice(0, 10).replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1") : input.value.trim();

      if (input.data.stored === updatingStorageValue) {
         // Handle no changes in attribute updates
         editOnly ? onBlur(null) : setIsEditing(false);
         return;
      }

      const response = await updateUserAttribute(user.id, id as any, updatingDatabaseValue);

      handleResponse(response, globalDispatch, updateNotification, async() => {
         globalDispatch({
            type: "updateState",
            value: {
               id: id,
               input: {
                  ...input,
                  data: {
                     ...input.data,
                     valid: id === "image" ? true : undefined,
                     verified: id === "email" || id === "phone" ? false : undefined,
                     stored: updatingStorageValue
                  }
               }
            }
         });

         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1500
         });

         editOnly ? onBlur(null) : setIsEditing(false);
      } );
   }, [
      id,
      user,
      globalDispatch,
      editOnly,
      onBlur,
      input,
      type,
      updateNotification
   ]);

   const doubleTap = useDoubleTap(() => setIsEditing(true) );

   return (
      <div className = "relative mx-auto w-full">
         {
            isEditing || editOnly ? (
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
                     onSubmit = { handleupdateUserAttribute }
                     onBlur = { undefined }
                     autoComplete = { id }
                  />
                  <Button
                     type = "submit"
                     className = "mt-2 h-10 w-full bg-green-500 text-white"
                     icon = { icon }
                     onClick = { handleupdateUserAttribute }
                  >
                     Update
                  </Button>
               </div>
            ) : (
               <div className = "my-2 flex flex-col items-center justify-center gap-x-3 gap-y-2 xsm:my-1 xsm:flex-row xsm:justify-between">
                  <div
                     className = "flex flex-col items-center justify-center gap-2 xsm:flex-row"
                     { ...doubleTap }
                  >
                     <FontAwesomeIcon
                        icon = { icon }
                        className = "w-8 text-lg text-primary xxsm:text-xl"
                     />
                     <h2 className = "max-w-[30rem] whitespace-pre-wrap break-all text-center text-base font-semibold xxsm:text-[1.1rem]">
                        { input.data.stored }
                     </h2>
                  </div>
                  <div className = "flex flex-row items-center justify-center gap-3">
                     {
                        input.data.verified !== undefined && input.value.trim() !== "" && (
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
               </div>
            )
         }
      </div>
   );
}

export function PasswordAttribute(props: VitalityProps): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const { globalState, globalDispatch } = props;
   const passwordModalRef = useRef<{ open: () => void; close: () => void }>(null);

   const handleupdateUserPassword = useCallback(async() => {
      const response = await updateUserPassword(
         user.id,
         globalState.oldPassword.value.trim(),
         globalState.newPassword.value.trim(),
         globalState.confirmPassword.value.trim()
      );

      handleResponse(response, globalDispatch, updateNotification, () => {
         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1500
         });

         // Remove all password errors, if any, and reset their values for future updates
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
      updateNotification,
      globalState.oldPassword,
      globalState.newPassword,
      globalState.confirmPassword
   ]);

   const doubleTap = useDoubleTap(() => passwordModalRef.current?.open());

   return (
      <div className = "relative mx-auto w-full">
         <div className = "my-2 flex flex-col items-center justify-center gap-x-3 gap-y-2 xsm:my-1 xsm:flex-row xsm:justify-between">
            <div
               className = "flex flex-col items-center justify-center gap-2 xsm:flex-row"
               { ...doubleTap }
            >
               <FontAwesomeIcon
                  icon = { faKey }
                  className = "w-8 text-lg text-primary xxsm:text-xl"
               />
               <h2 className = "text-base font-semibold xxsm:text-[1.1rem]">
                  ********
               </h2>
            </div>
            <div className = "flex flex-row items-center justify-center gap-2">
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
                  <div className = "relative flex flex-col items-center justify-center gap-6 text-center">
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
                           onSubmit = { handleupdateUserPassword }
                           autoComplete = "current-password"
                        />
                        <Input
                           id = "newPassword"
                           type = "password"
                           label = "New Password"
                           icon = { faKey }
                           input = { globalState.newPassword }
                           dispatch = { globalDispatch }
                           onSubmit = { handleupdateUserPassword }
                           autoComplete = "new-password"
                        />
                        <Input
                           id = "confirmPassword"
                           type = "password"
                           label = "Confirm Password"
                           icon = { faKey }
                           input = { globalState.confirmPassword }
                           dispatch = { globalDispatch }
                           onSubmit = { handleupdateUserPassword }
                           autoComplete = "new-password"
                        />
                        <Button
                           type = "submit"
                           className = "h-[2.6rem] whitespace-nowrap rounded-md bg-primary p-5 text-sm font-bold text-white xxsm:text-base"
                           icon = { faKey }
                           onClick = { handleupdateUserPassword }
                        >
                           Update
                        </Button>
                     </div>
                  </div>
               </Modal>
            </div>
         </div>
      </div>
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
   const { updateNotification } = useContext(NotificationContext);
   const { id, icon, label, onChange, checked, globalState, globalDispatch } = props;

   const handleOnChange = useCallback(async() => {
      const response = await updateUserPreference(user.id, id, !checked);

      handleResponse(response, globalDispatch, updateNotification, () => {
         globalDispatch({
            type: "updateState",
            value: {
               id: id,
               input: {
                  ...globalState[id],
                  value: !checked
               }
            }
         });

         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 1500
         });
      });

   }, [
      id,
      user,
      checked,
      globalState,
      globalDispatch,
      updateNotification
   ]);

   return (
      <div className = "relative mx-auto w-full">
         <div className = "my-2 flex flex-col items-center justify-center gap-x-3 gap-y-2 xsm:my-1 xsm:flex-row xsm:justify-between">
            <div className = "flex flex-col items-center justify-center gap-2 xsm:flex-row">
               <FontAwesomeIcon
                  icon = { icon }
                  className = "w-8 text-lg text-primary xxsm:text-xl"
               />
               <h2 className = "max-w-[30rem] whitespace-pre-wrap break-all text-base font-semibold xxsm:text-[1.1rem]">
                  { label }
               </h2>
            </div>
            <div className = "relative">
               <label className = "inline-flex cursor-pointer items-center">
                  <input
                     id = { id ?? "darkMode" }
                     type = "checkbox"
                     value = ""
                     className = "peer sr-only"
                     onChange = { onChange ?? handleOnChange }
                     checked = { checked }
                  />
                  <div className = "peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/60 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-primary/60"></div>
               </label>
            </div>
         </div>
      </div>
   );
}