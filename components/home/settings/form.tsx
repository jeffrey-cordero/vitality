import { faAt, faCakeCandles, faComments, faLink, faMoon, faPaperPlane, faPenToSquare, faPersonWalkingLuggage, faPhone, faSignature, faUserSecret, faUserXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { users as User } from "@prisma/client";
import Image from "next/image";
import { useCallback, useContext, useEffect, useReducer } from "react";

import { AuthenticationContext, NotificationContext } from "@/app/layout";
import Heading from "@/components/global/heading";
import ImageForm from "@/components/global/images";
import Loading from "@/components/global/loading";
import { AccountAction, GeneralAttribute, PasswordAttribute, SliderAttribute } from "@/components/home/settings/attribute";
import { fetchAttributes } from "@/lib/authentication/authorize";
import { endSession } from "@/lib/authentication/session";
import { normalizeDate } from "@/lib/authentication/shared";
import { formReducer, VitalityState } from "@/lib/global/reducer";
import { processResponse, VitalityResponse } from "@/lib/global/response";
import { deleteAccount, updateAttribute } from "@/lib/home/settings/settings";

const form: VitalityState = {
   username: {
      id: "username",
      value: "",
      error: null
   },
   oldPassword: {
      id: "oldPassword",
      value: "",
      error: null
   },
   newPassword: {
      id: "newPassword",
      value: "",
      error: null
   },
   confirmPassword: {
      id: "confirmPassword",
      value: "",
      error: null
   },
   name: {
      id: "name",
      value: "",
      error: null
   },
   birthday: {
      id: "birthday",
      value: "",
      error: null
   },
   email: {
      id: "email",
      value: "",
      error: null
   },
   phone: {
      id: "phone",
      value: "",
      error: null
   },
   image: {
      id: "image",
      value: "",
      error: null,
      handlesChanges: true,
      data: {
         valid: undefined,
         fetched: false,
         stored: ""
      }
   },
   mail: {
      id: "mail",
      value: false,
      error: null
   },
   sms: {
      id: "sms",
      value: false,
      error: null
   }
};

export default function Form(): JSX.Element {
   const { user, theme, updateTheme } = useContext(AuthenticationContext);
   const { updateNotifications } = useContext(NotificationContext);
   const [globalState, globalDispatch] = useReducer(formReducer, form);

   // Determine if attributes have been fetched from the server
   const fetched: boolean = globalState.image.data?.fetched ?? false;
   const imageURL: string = globalState.image.data?.stored.trim();

   const fetchAttributeData = useCallback(async() => {
      const attributes: User = await fetchAttributes(user.id);

      globalDispatch({
         type: "updateStates",
         value: {
            username: {
               value: attributes.username,
               data: {
                  stored: attributes.username
               }
            },
            name: {
               value: attributes.name,
               data: {
                  stored: attributes.name
               }
            },
            birthday: {
               value: attributes.birthday.toISOString().split("T")[0],
               data: {
                  stored: normalizeDate(attributes.birthday)
               }
            },
            email: {
               value: attributes.email,
               data: {
                  stored: attributes.email,
                  verified: attributes.email_verified
               }
            },
            phone: {
               value: attributes.phone ?? "",
               data: {
                  stored: attributes.phone ?? "",
                  verified: attributes.phone_verified
               }
            },
            image: {
               value: attributes.image,
               data: {
                  valid: true,
                  fetched: true,
                  stored: attributes.image
               }
            },
            mail: {
               value: attributes.mail
            },
            sms: {
               value: attributes.sms
            }
         }
      });
   }, [user]);

   const verifyImageResource = useCallback((valid: boolean) => {
      globalDispatch({
         type: "updateState",
         value: {
            id: "image",
            value: {
               error: valid ? null : "Failed to fetch your desired image resource",
               data: {
                  valid: valid
               }
            }
         }
      });
   }, []);

   const submitUpdateImage = useCallback(async() => {
      const image: string = globalState.image.value.trim();
      const response: VitalityResponse<boolean> = await updateAttribute(user.id, "image", image);

      processResponse(response, globalDispatch, updateNotifications, async() => {
         const updates: boolean = response.body.data;

         globalDispatch({
            type: "updateState",
            value: {
               id: "image",
               value: {
                  value: image,
                  error: null,
                  data: {
                     valid: true,
                     stored: image
                  }
               }
            }
         });

         // Close the image form modal after a successful update
         const imageForm = document.getElementById("image-form-container");

         updates && (imageForm?.getElementsByClassName("modal-close").item(0) as SVGElement)?.dispatchEvent(
            new MouseEvent("click", {
               bubbles: true,
               cancelable: true,
               view: window
            }),
         );
      });
   }, [
      user,
      updateNotifications,
      globalState.image.value
   ]);

   const logout = useCallback(async() => {
      await endSession();
      window.location.reload();
   }, []);

   const submitDeleteAccount = useCallback(async() => {
      processResponse(await deleteAccount(user.id), globalDispatch, updateNotifications, async() => {
         // Remove all local storage data and end the session permanently
         window.localStorage.clear();
         await logout();
      });
   }, [
      user,
      logout,
      updateNotifications
   ]);

   useEffect(() => {
      if (!fetched) {
         fetchAttributeData();
      }
   });

   return (
      <div className = "relative mx-auto mb-8 w-full px-2 text-left xsm:mb-16 sm:w-11/12 lg:w-3/4 2xl:w-1/2">
         {
            fetched ? (
               <div className = "flex flex-col items-center justify-center gap-7">
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Profile"
                        message = "Customize your profile with a personal touch"
                     />
                     <div className = "relative flex flex-col items-center justify-center gap-4">
                        <div className = "relative flex size-32 flex-col items-center justify-center overflow-hidden rounded-full border-[3px] border-primary min-[225px]:size-36 xxsm:size-40">
                           <Image
                              fill
                              priority
                              tabIndex = { 0 }
                              quality = { 100 }
                              sizes = "100%"
                              src = { imageURL === "" || globalState.image.data?.valid === false ? "/home/settings/default.png" : imageURL }
                              alt = "workout-image"
                              className = "bg-transparent object-cover object-center"
                              onLoad = { () => globalState.image.data?.valid === false && verifyImageResource(true) }
                              onErrorCapture = { () => verifyImageResource(false) }
                           />
                        </div>
                        <ImageForm
                           id = "image"
                           type = "text"
                           label = "URL"
                           icon = { faLink }
                           input = { globalState.image }
                           dispatch = { globalDispatch }
                           onSubmit = { submitUpdateImage }
                           display = {
                              <FontAwesomeIcon
                                 icon = { faPenToSquare }
                                 className = "z-10 cursor-pointer text-lg text-primary hover:text-primary/80 xxsm:text-xl"
                              />
                           }
                           page = "settings"
                        />
                     </div>
                     <div className = "relative mx-auto mt-4 flex w-full flex-col items-stretch justify-center gap-11 sm:gap-6">
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
                  </div>
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Security"
                        message = "Secure your account with tailored protection"
                     />
                     <div className = "relative mx-auto flex w-full flex-col items-stretch justify-center gap-11 sm:gap-6">
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
                  </div>
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Preferences"
                        message = "Craft your personalized experience"
                     />
                     <div className = "relative mx-auto flex w-full flex-col items-stretch justify-center gap-11 sm:gap-6">
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
                  </div>
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Actions"
                        message = "Control your account with essential actions"
                     />
                     <div className = "relative mx-auto flex w-full flex-col items-stretch justify-center gap-11 sm:gap-6">
                        <AccountAction
                           action = "session"
                           message = "Log out?"
                           icon = { faPersonWalkingLuggage }
                           label = "Log Out"
                           onConfirmation = { logout }
                           globalState = { globalState }
                           globalDispatch = { globalDispatch }
                        />
                        <AccountAction
                           action = "delete"
                           message = "Permanently delete your account?"
                           icon = { faUserXmark }
                           label = "Delete Account"
                           onConfirmation = { submitDeleteAccount }
                           globalState = { globalState }
                           globalDispatch = { globalDispatch }
                        />
                     </div>
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