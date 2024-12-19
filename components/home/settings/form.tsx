import Image from "next/image";
import Button from "@/components/global/button";
import Heading from "@/components/global/heading";
import Loading from "@/components/global/loading";
import { users as User } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { endSession } from "@/lib/authentication/session";
import { GeneralAttribute, PasswordAttribute, SliderAttribute } from "@/components/home/settings/attribute";
import { formReducer, VitalityState } from "@/lib/global/state";
import { fetchUserInformation } from "@/lib/authentication/authorize";
import { AuthenticationContext } from "@/app/layout";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { faAt, faRightFromBracket, faImage, faPhone, faUserSecret, faCakeCandles, faSignature, faMoon, faPaperPlane, faComments, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

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
      handlesOnChange: true
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
   const [globalState, globalDispatch] = useReducer(formReducer, form);
   const [isEditingImage, setIsEditingImage] = useState<boolean>(false);

   const imageURL = useMemo(() => {
      return globalState.image.data.stored.trim();
   }, [globalState.image.data.stored]);

   const handleFetchUser = useCallback(async() => {
      const information: User = await fetchUserInformation(user.id);

      globalDispatch({
         type: "initializeState",
         value: {
            username: {
               ...globalState.username,
               value: information.username,
               data: {
                  stored: information.username
               }
            },
            name: {
               ...globalState.name,
               value: information.name,
               data: {
                  stored: information.name
               }
            },
            birthday: {
               ...globalState.birthday,
               value: information.birthday.toISOString().split("T")[0],
               data: {
                  stored: information.birthday.toISOString().slice(0, 10).replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1")
               }
            },
            email: {
               ...globalState.email,
               value: information.email,
               data: {
                  stored: information.email,
                  verified: information.email_verified
               }
            },
            phone: {
               ...globalState.phone,
               value: information.phone,
               data: {
                  stored: information.phone,
                  verified: information.phone_verified
               }
            },
            image: {
               ...globalState.image,
               value: information.image,
               data: {
                  ...globalState.image.data,
                  valid: true,
                  fetched: true,
                  stored: information.image
               }
            },
            mail: {
               ...globalState.mail,
               value: information.mail
            },
            sms: {
               ...globalState.sms,
               value: information.sms
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

   const handleImageURLChanges = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      // Ensure any changes to URL are verified on a new submission
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

   const handleImageResourceValidity = useCallback((valid: boolean) => {
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

   useEffect(() => {
      if (!globalState.image.data.fetched) {
         handleFetchUser();
      }
   });

   return (
      <div className = "relative mx-auto mb-12 w-full px-2 text-left xsm:w-11/12 sm:w-3/4 xl:w-5/12">
         {
            globalState.image.data.fetched ? (
               <div className = "flex flex-col items-center justify-center gap-4">
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Profile"
                        description = "Customize your profile with a personal touch"
                     />
                     {
                        !isEditingImage ? (
                           <div className = "relative flex flex-col items-center justify-center gap-4">
                              <div className = "relative flex size-40 flex-col items-center justify-center overflow-hidden rounded-full border-[3px] border-primary shadow-md xxsm:size-44">
                                 {
                                    globalState.image.data.valid !== false ? (
                                       <Image
                                          fill
                                          priority
                                          tabIndex = { 0 }
                                          quality = { 100 }
                                          sizes = "100%"
                                          src = { imageURL === "" ? "/settings/default.png" : imageURL }
                                          alt = "workout-image"
                                          className = "object-cover object-center shadow-md"
                                          onLoad = { () => globalState.image.data.valid === false && handleImageResourceValidity(true) }
                                          onErrorCapture = { () => handleImageResourceValidity(false) }
                                       />
                                    ) : (
                                       <div className = "flex size-full items-center justify-center">
                                          <FontAwesomeIcon
                                             icon = { faImage }
                                             className = "text-7xl text-red-500"
                                          />
                                       </div>
                                    )
                                 }
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
                              onChange = { handleImageURLChanges }
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
                        description = "Secure your account with tailored protection"
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
                  </div>
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
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Preferences"
                        description = "Craft your personalized experience"
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
                  <Button
                     type = "submit"
                     className = "mt-4 h-[2.8rem] rounded-md bg-red-500 p-4 text-sm font-bold text-white focus:ring-red-700 xxsm:p-5 xxsm:text-base"
                     icon = { faRightFromBracket }
                     onClick = {
                        async() => {
                           await endSession();
                           window.location.reload();
                        }
                     }
                  >
                     Log Out
                  </Button>
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