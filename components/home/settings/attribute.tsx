
import Modal from "@/components/global/modal";
import Button from "@/components/global/button";
import { useDoubleTap } from "use-double-tap";
import { Input } from "@/components/global/input";
import { handleResponse } from "@/lib/global/response";
import { updateAttribute, updatePassword, updatePreference } from "@/lib/settings/service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VitalityInputProps } from "@/components/global/input";
import { VitalityProps } from "@/lib/global/state";
import VerifyAttribute from "@/components/home/settings/verification";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { ChangeEvent, useCallback, useContext, useRef, useState } from "react";
import { faArrowRotateLeft, faXmark, faPencil, faKey, IconDefinition } from "@fortawesome/free-solid-svg-icons";

export interface AttributeProps extends VitalityProps, VitalityInputProps {
   editOnly?: boolean;
}

export function Attribute(props: AttributeProps) {
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

   const handleUpdateUser = useCallback(async() => {
      const updatingDatabaseValue: Date | string = type === "date"
         ? new Date(input.value) : input.value.trim();
      const updatingStorageValue: string = type === "date" ?
         new Date(input.value).toISOString().slice(0, 10).replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1") : input.value.trim();

      if (input.data.stored === updatingStorageValue) {
         // Handle no changes in attribute updates
         editOnly ? onBlur(null) : setIsEditing(false);
         return;
      }

      const response = await updateAttribute(user.id, id as any, updatingDatabaseValue);

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
            message: `Successfully updated ${id === "phone" ? "phone number" : id}`,
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
               <form
                  onSubmit = { (e) => e.preventDefault() }
                  className = "relative mt-8"
               >
                  <FontAwesomeIcon
                     icon = { faArrowRotateLeft }
                     className = "absolute right-[35px] top-[-25px] z-10 size-4 shrink-0 cursor-pointer text-base text-primary"
                     onClick = { handleResetInput }
                  />
                  <FontAwesomeIcon
                     icon = { faXmark }
                     className = "absolute right-[10px] top-[-27px] z-10 size-4 shrink-0 cursor-pointer text-xl text-red-500"
                     onClick = { () => { editOnly ? onBlur(null) : setIsEditing(false); } }
                  />
                  <Input
                     { ...props }
                     onSubmit = { handleUpdateUser }
                     onBlur = { undefined }
                     autoComplete = { id }
                  />
                  <Button
                     type = "submit"
                     className = "mt-2 h-10 w-full bg-green-500 text-white"
                     icon = { icon }
                     onClick = { handleUpdateUser }
                  >
                     Update
                  </Button>
               </form>
            ) : (
               <div className = "flex flex-row items-center justify-between gap-2">
                  <div
                     className = "flex flex-row items-center justify-center gap-2"
                     { ...doubleTap }
                  >
                     <FontAwesomeIcon
                        icon = { icon }
                        className = "w-8 text-xl text-primary"
                     />
                     <h2 className = "pl-2 text-lg font-semibold">
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
                        icon = { faPencil }
                        className = "cursor-pointer text-lg text-primary"
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

   const handleUpdatePassword = useCallback(async() => {
      const response = await updatePassword(
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

         // Remove all password errors, if any
         globalDispatch({
            type: "updateStates",
            value: {
               oldPassword: {
                  ...globalState.oldPassword,
                  error: null
               },
               newPassword: {
                  ...globalState.newPassword,
                  error: null
               },
               confirmPassword: {
                  ...globalState.confirmPassword,
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
         <div className = "flex flex-row items-center justify-between gap-2">
            <div
               className = "flex flex-row items-center justify-center gap-2"
               { ...doubleTap }
            >
               <FontAwesomeIcon
                  icon = { faKey }
                  className = "w-8 text-xl text-primary"
               />
               <h2 className = "pl-2 text-lg font-semibold">
                  ************
               </h2>
            </div>
            <div className = "flex flex-row items-center justify-center gap-2">
               <Modal
                  ref = { passwordModalRef }
                  display = {
                     <FontAwesomeIcon
                        icon = { faPencil }
                        className = "cursor-pointer text-lg text-primary"
                     />
                  }
                  className = "mt-12 max-h-[90%] max-w-full sm:max-w-xl"
               >
                  <div className = "relative flex flex-col items-center justify-center gap-6 text-center">
                     <FontAwesomeIcon
                        icon = { faKey }
                        className = "mt-6 text-4xl text-primary"
                     />
                     <div className = "relative mx-auto flex items-center justify-center text-center">
                        <p className = "font-semibold">
                           Please enter your old password, followed by your new password and confirmation to update your credentials
                        </p>
                     </div>
                     <form
                        onSubmit = { (e) => e.preventDefault() }
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
                           onSubmit = { handleUpdatePassword }
                        />
                        <Input
                           id = "newPassword"
                           type = "password"
                           label = "New Password"
                           icon = { faKey }
                           input = { globalState.newPassword }
                           dispatch = { globalDispatch }
                           onSubmit = { handleUpdatePassword }
                        />
                        <Input
                           id = "confirmPassword"
                           type = "password"
                           label = "Confirm Password"
                           icon = { faKey }
                           input = { globalState.confirmPassword }
                           dispatch = { globalDispatch }
                           onSubmit = { handleUpdatePassword }
                        />
                        <Button
                           type = "submit"
                           className = "h-[2.6rem] whitespace-nowrap rounded-md bg-primary p-5 text-sm font-bold text-white xxsm:text-base"
                           icon = { faKey }
                           onClick = { handleUpdatePassword }
                        >
                           Update
                        </Button>
                     </form>

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
      const response = await updatePreference(user.id, id, !checked);

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
         <div className = "flex flex-row items-center justify-between gap-2">
            <div className = "flex flex-row items-center justify-center gap-2">
               <FontAwesomeIcon
                  icon = { icon }
                  className = "w-8 text-xl text-primary"
               />
               <h2 className = "pl-2 text-lg font-semibold">
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