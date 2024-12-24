import { faAt, faCakeCandles, faComments, faImage, faMoon, faPaperPlane, faPenToSquare, faPhone, faSignature, faUserLock, faUserSecret, faUserXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { users as User } from "@prisma/client";
import Image from "next/image";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Heading from "@/components/global/heading";
import Loading from "@/components/global/loading";
import { AccountAction, GeneralAttribute, PasswordAttribute, SliderAttribute } from "@/components/home/settings/attribute";
import { fetchAttributes } from "@/lib/authentication/authorize";
import { endSession } from "@/lib/authentication/session";
import { formReducer, VitalityState } from "@/lib/global/reducer";
import { processResponse } from "@/lib/global/response";
import { deleteAccount } from "@/lib/home/settings/service";

const form: VitalityState = {
   username: {
      value: "",
      error: null,
      data: {}
   },
   oldPassword: {
      value: "",
      error: null,
      data: {}
   },
   newPassword: {
      value: "",
      error: null,
      data: {}
   },
   confirmPassword: {
      value: "",
      error: null,
      data: {}
   },
   name: {
      value: "",
      error: null,
      data: {}
   },
   birthday: {
      value: "",
      error: null,
      data: {}
   },
   email: {
      value: "",
      error: null,
      data: {}
   },
   phone: {
      value: "",
      error: null,
      data: {}
   },
   image: {
      value: "",
      error: null,
      data: {
         valid: undefined,
         fetched: false,
         stored: ""
      },
      handlesChanges: true
   },
   mail: {
      value: false,
      error: null,
      data: {}
   },
   sms: {
      value: false,
      error: null,
      data: {}
   }
};

export default function Form(): JSX.Element {
   const { user, theme, updateTheme } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const [globalState, globalDispatch] = useReducer(formReducer, form);
   const [isEditingImage, setIsEditingImage] = useState<boolean>(false);

   const imageURL: string = useMemo(() => {
      return globalState.image.data?.stored.trim();
   }, [globalState.image.data?.stored]);

   const handleFetchAttributes = useCallback(async() => {
      const attributes: User = await fetchAttributes(user.id);

      globalDispatch({
         type: "initializeState",
         value: {
            username: {
               ...globalState.username,
               value: attributes.username,
               data: {
                  stored: attributes.username
               }
            },
            name: {
               ...globalState.name,
               value: attributes.name,
               data: {
                  stored: attributes.name
               }
            },
            birthday: {
               ...globalState.birthday,
               value: attributes.birthday.toISOString().split("T")[0],
               data: {
                  stored: attributes.birthday.toISOString().slice(0, 10).replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1")
               }
            },
            email: {
               ...globalState.email,
               value: attributes.email,
               data: {
                  stored: attributes.email,
                  verified: attributes.email_verified
               }
            },
            phone: {
               ...globalState.phone,
               value: attributes.phone ?? "",
               data: {
                  stored: attributes.phone ?? "",
                  verified: attributes.phone_verified
               }
            },
            image: {
               ...globalState.image,
               value: attributes.image,
               data: {
                  ...globalState.image.data,
                  valid: true,
                  fetched: true,
                  stored: attributes.image
               }
            },
            mail: {
               ...globalState.mail,
               value: attributes.mail
            },
            sms: {
               ...globalState.sms,
               value: attributes.sms
            }
         }
      });
   }, [
      user,
      globalState.username,
      globalState.name,
      globalState.birthday,
      globalState.email,
      globalState.phone,
      globalState.image,
      globalState.mail,
      globalState.sms
   ]);

   const handleImageURLOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      // Ensure any changes to user image URL are verified on a new submission
      globalDispatch({
         type: "updateState",
         value: {
            id: "image",
            input: {
               ...globalState.image,
               value: event.target.value,
               error: null,
               data: {
                  ...globalState.image.data,
                  valid: undefined
               }
            }
         }
      });
   }, [
      globalDispatch,
      globalState.image
   ]);

   const handleVerifyImageResource = useCallback((valid: boolean) => {
      globalDispatch({
         type: "updateState",
         value: {
            id: "image",
            input: {
               ...globalState.image,
               error: valid ? null : "Failed to fetch your desired image resource",
               data: {
                  ...globalState.image.data,
                  valid: valid
               }
            }
         }
      });
   }, [globalState.image]);

   const handleLogOut = useCallback(async() => {
      await endSession();
      window.location.reload();
   }, []);

   const handleDeleteAccount = useCallback(async() => {
      processResponse(await deleteAccount(user.id), globalDispatch, updateNotifications, async() => {
         await handleLogOut();
      });
   }, [
      user,
      handleLogOut,
      updateNotifications
   ]);

   useEffect(() => {
      !globalState.image.data?.fetched && handleFetchAttributes();
   });

   return (
      <div className = "relative mx-auto mb-8 w-full px-2 text-left xsm:mb-16 xsm:w-11/12 sm:w-3/4 2xl:w-1/2">
         {
            globalState.image.data?.fetched ? (
               <div className = "flex flex-col items-center justify-center gap-6">
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Profile"
                        message = "Customize your profile with a personal touch"
                     />
                     {
                        !isEditingImage ? (
                           <div className = "relative flex flex-col items-center justify-center gap-4">
                              <div className = "relative flex size-32 flex-col items-center justify-center overflow-hidden rounded-full border-[3px] border-primary shadow-md min-[225px]:size-40 xxsm:size-44">
                                 <Image
                                    fill
                                    priority
                                    tabIndex = { 0 }
                                    quality = { 100 }
                                    sizes = "100%"
                                    src = { imageURL === "" || globalState.image.data?.valid === false ? "/settings/default.png" : imageURL }
                                    alt = "workout-image"
                                    className = "bg-gray-50 object-cover object-center shadow-md dark:bg-gray-200"
                                    onLoad = { () => globalState.image.data?.valid === false && handleVerifyImageResource(true) }
                                    onErrorCapture = { () => handleVerifyImageResource(false) }
                                 />
                              </div>
                              <FontAwesomeIcon
                                 icon = { faPenToSquare }
                                 className = "z-10 mb-2 cursor-pointer text-lg text-primary hover:text-primary/80 xxsm:text-xl xsm:mb-6"
                                 onClick = { () => setIsEditingImage(true) }
                              />
                           </div>

                        ) : (
                           <GeneralAttribute
                              id = "image"
                              type = "text"
                              label = "Image"
                              icon = { faImage }
                              input = { globalState.image }
                              dispatch = { globalDispatch }
                              onBlur = { () => setIsEditingImage(false) }
                              onChange = { handleImageURLOnChange }
                              globalState = { globalState }
                              globalDispatch = { globalDispatch }
                              editOnly
                           />
                        )
                     }
                     <GeneralAttribute
                        id = "name"
                        type = "text"
                        label = "Name"
                        icon = { faSignature }
                        input = { globalState.name }
                        dispatch = { globalDispatch }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                     <GeneralAttribute
                        id = "birthday"
                        type = "date"
                        label = "Birthday"
                        icon = { faCakeCandles }
                        input = { globalState.birthday }
                        dispatch = { globalDispatch }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                  </div>
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Security"
                        message = "Secure your account with tailored protection"
                     />
                     <GeneralAttribute
                        id = "username"
                        type = "text"
                        label = "Username"
                        icon = { faUserSecret }
                        input = { globalState.username }
                        dispatch = { globalDispatch }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                     <GeneralAttribute
                        id = "email"
                        type = "email"
                        label = "Email"
                        icon = { faAt }
                        input = { globalState.email }
                        dispatch = { globalDispatch }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                     <GeneralAttribute
                        id = "phone"
                        type = "tel"
                        label = "Phone"
                        icon = { faPhone }
                        input = { globalState.phone }
                        dispatch = { globalDispatch }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                     <PasswordAttribute
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                  </div>
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Preferences"
                        message = "Craft your personalized experience"
                     />
                     <SliderAttribute
                        id = { null }
                        label = "Dark Mode"
                        icon = { faMoon }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                        checked = { theme === "dark" }
                        onChange = { () => updateTheme(theme === "dark" ? "light" : "dark") }
                     />
                     <SliderAttribute
                        id = "mail"
                        label = "Email Notifications"
                        icon = { faPaperPlane }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                        checked = { globalState.mail.value === true }
                        onChange = { undefined }
                     />
                     <SliderAttribute
                        id = "sms"
                        label = "SMS Notifications"
                        icon = { faComments }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                        checked = { globalState.sms.value === true }
                        onChange = { undefined }
                     />
                  </div>
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Actions"
                        message = "Control your account with essential actions"
                     />
                     <AccountAction
                        action = "session"
                        message = "Log out of your account?"
                        icon = { faUserLock }
                        label = "Log Out"
                        onConfirmation = { handleLogOut }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                     <AccountAction
                        action = "delete"
                        message = "Permanently delete your account?"
                        icon = { faUserXmark }
                        label = "Delete Account"
                        onConfirmation = { handleDeleteAccount }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                  </div>
               </div>
            ) : (
               <div className = "flex min-h-screen items-center justify-center">
                  <Loading />
               </div>
            )
         }
      </div>
   );
}