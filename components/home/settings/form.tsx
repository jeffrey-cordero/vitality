import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import Modal from "@/components/global/modal";
import Button from "@/components/global/button";
import Loading from "@/components/global/loading";
import { useDoubleTap } from "use-double-tap";
import { users as User } from "@prisma/client";
import { Input } from "@/components/global/input";
import { handleResponse } from "@/lib/global/response";
import { updateUserAttribute } from "@/lib/settings/update";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { endSession } from "@/lib/authentication/session";
import { VitalityInputProps } from "@/components/global/input";
import { formReducer, VitalityProps, VitalityState } from "@/lib/global/state";
import { fetchUserInformation } from "@/lib/authentication/authorize";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { faArrowRotateLeft, faAt, faRightFromBracket, faXmark, faPencil, faImage, faPhone, faUserSecret, faCakeCandles, faSignature, faShieldHalved, faShield, faPhotoFilm, faKey, faBell, faMoon, faCalendar } from "@fortawesome/free-solid-svg-icons";
import Heading from "@/components/global/heading";

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

const form: VitalityState = {
   username: {
      value: "",
      error: null,
      data: {}
   },
   password: {
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
   notifications: {
      value: "",
      error: null,
      data: {}
   },
   dark: {
      value: "",
      error: null,
      data: {}
   }
};

interface VerifyAttributeProps extends AttributeProps {
   attribute: "email" | "phone";
}

function VerifyAttribute(props: VerifyAttributeProps): JSX.Element {
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
      for (let i = 0; i <= 3; i++) {
         if (inputs[i][1].value.trim() === "") {
            return;
         }
      }

      handleResponse(await updateUserAttribute(user.id, `${attribute}_verified`, true), localDispatch, updateNotification, () => {
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
            message: `Successful ${attribute} verification`,
            timer: 1000
         });

         verificationModalRef.current?.close();
      });

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
                  { `A one-time verification code has been sent to your ${attribute}. Please enter it below to complete the process.` }
               </p>
            </div>
            <div className = "mx-auto flex w-full flex-row items-center justify-center gap-3">
               {
                  Array.from({ length: 4 }, (_, index) => {
                     return (
                        <div
                           className = "size-10 font-bold xxsm:size-12 xsm:size-14"
                           key = { index }
                        >
                           <input
                              className = "flex size-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-2 text-center text-lg outline-none focus:border-[1.5px] focus:border-primary dark:border-0 dark:bg-gray-700/50"
                              onChange = { (event: ChangeEvent<HTMLInputElement>) => handleInputChange(event, index) }
                              type = "text"
                              maxLength = { 1 }
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
                  <Link
                     href = "#"
                     className = "break-words font-bold text-primary"
                  >
                     Resend
                  </Link>
               </p>
            </div>
         </div>
      </Modal>
   );

}

interface AttributeProps extends VitalityProps, VitalityInputProps {
   editOnly?: boolean;
}

function Attribute(props: AttributeProps) {
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
      const response = await updateUserAttribute(user.id, id as any, type === "date" ? new Date(input.value) : input.value);

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
                     stored: type === "date" ? new Date(input.value).toISOString().slice(0, 10).replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1") : input.value
                  }
               }
            }
         });

         updateNotification({
            status: response.status,
            message: response.body.message,
            timer: 700
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
                     className = "absolute right-[10px] top-[-27px] z-10 size-4 shrink-0 cursor-pointer text-xl text-red-500"
                     onClick = { () => { editOnly ? onBlur(null) : setIsEditing(false); } }
                  />
                  <Input
                     { ...props }
                     onSubmit = { handleUpdateUser }
                     onBlur = { undefined }
                  />
                  <Button
                     type = "button"
                     className = "mt-2 h-10 w-full bg-green-500 text-white"
                     icon = { icon }
                     onClick = { handleUpdateUser }
                  >
                     Update
                  </Button>
               </div>
            ) : (
               <div className = "flex flex-row items-center justify-between gap-2">
                  <div className = "flex flex-row items-center justify-center gap-2">
                     <FontAwesomeIcon
                        icon = { icon }
                        className = "w-8 text-xl text-primary"
                     />
                     <h2
                        className = "pl-2 text-lg font-medium"
                        { ...doubleTap }
                     >
                        { input.data.stored }
                     </h2>
                  </div>
                  <div className = "flex flex-row items-center justify-center gap-3">
                     {
                        input.data.verified !== undefined && (
                           <VerifyAttribute
                              attribute = { id === "email" ? "email" : "phone" }
                              { ...props }
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
            notifications: {
               ...globalState.notifications,
               value: information.notifications
            },
            dark: {
               ...globalState.dark,
               value: theme === "dark"
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
      globalState.notifications
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
      <div className = "relative mx-auto mb-12 w-11/12 text-left sm:w-3/4 xl:w-5/12">
         {
            globalState.image.data.fetched ? (
               <div className = "flex flex-col items-center justify-center gap-4">
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4">
                     <Heading
                        title = "Profile"
                        description = "Shape your profile with key personal details"
                     />
                     {
                        !isEditingImage ? (
                           <div className = "relative flex flex-col items-center justify-center gap-4">
                              <div className = "relative flex size-36 flex-col items-center justify-center overflow-hidden rounded-full border-[3px] border-primary shadow-md">
                                 {
                                    globalState.image.data.valid === true ? (
                                       <Image
                                          fill
                                          priority
                                          tabIndex = { 0 }
                                          quality = { 100 }
                                          sizes = "100%"
                                          src = { imageURL === "" ? "/settings/default.png" : imageURL }
                                          alt = "workout-image"
                                          className = "cursor-pointer object-cover object-center shadow-md"
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
                                 icon = { faPhotoFilm }
                                 className = "z-10 cursor-pointer text-xl text-primary transition duration-300 ease-in-out hover:scale-105"
                                 onClick = { () => setIsEditingImage(true) }
                              />
                           </div>

                        ) : (
                           <Attribute
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
                     <Attribute
                        id = "name"
                        type = "text"
                        label = "Name"
                        icon = { faSignature }
                        input = { globalState.name }
                        dispatch = { globalDispatch }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                     <Attribute
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
                        description = "Fortify your account with personalized security settings"
                     />
                     <Attribute
                        id = "username"
                        type = "text"
                        label = "Username"
                        icon = { faUserSecret }
                        input = { globalState.username }
                        dispatch = { globalDispatch }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                     <Attribute
                        id = "email"
                        type = "email"
                        label = "Email"
                        icon = { faAt }
                        input = { globalState.email }
                        dispatch = { globalDispatch }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                     <Attribute
                        id = "phone"
                        type = "tel"
                        label = "Phone"
                        icon = { faPhone }
                        input = { globalState.phone }
                        dispatch = { globalDispatch }
                        globalState = { globalState }
                        globalDispatch = { globalDispatch }
                     />
                     <div className = "relative mx-auto w-full">
                        <div className = "flex flex-row items-center justify-between gap-2">
                           <div className = "flex flex-row items-center justify-center gap-2">
                              <FontAwesomeIcon
                                 icon = { faKey }
                                 className = "w-8 text-xl text-primary"
                              />
                              <h2 className = "pl-2 text-xl font-semibold">
                                 **************
                              </h2>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className = "relative mx-auto w-full">
                     <Heading
                        title = "Preferences"
                        description = "Craft your personalized experience"
                     />
                     <div className = "relative mx-auto w-full">
                        <div className = "flex flex-row items-center justify-between gap-2">
                           <div className = "flex flex-row items-center justify-center gap-2">
                              <FontAwesomeIcon
                                 icon = { faBell }
                                 className = "w-8 text-xl text-primary"
                              />
                              <h2 className = "pl-2 text-xl font-semibold">
                                 Notifications
                              </h2>
                           </div>
                           <div className = "relative">
                              <label className = "inline-flex cursor-pointer items-center">
                                 <input
                                    type = "checkbox"
                                    value = ""
                                    className = "peer sr-only"
                                    onChange={() => {
                                       globalDispatch({
                                          type: "updateState",
                                          value: {
                                             id: "notifications",
                                             input : {
                                                ...globalState.notifications,
                                                value: !globalState.notifications.value
                                             }
                                          }
                                       })
                                    }}
                                    checked = { globalState.notifications.value === true }
                                 />
                                 <div className = "peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                              </label>
                           </div>
                        </div>
                     </div>
                     <div className = "relative mx-auto w-full">
                        <div className = "flex flex-row items-center justify-between gap-2">
                           <div className = "flex flex-row items-center justify-center gap-2">
                              <FontAwesomeIcon
                                 icon = { faMoon }
                                 className = "w-8 text-xl text-primary"
                              />
                              <h2 className = "pl-2 text-xl font-semibold">
                                 Dark Mode
                              </h2>
                           </div>
                           <div className = "relative">
                              <label className = "inline-flex cursor-pointer items-center">
                                 <input
                                    type = "checkbox"
                                    value = ""
                                    className = "peer sr-only"
                                    onChange={() => {
                                       updateTheme(theme === "dark" ? "light" : "dark");

                                       globalDispatch({
                                          type: "updateState",
                                          value: {
                                             id: "dark",
                                             input : {
                                                ...globalState.dark,
                                                value: !globalState.dark.value
                                             }
                                          }
                                       });
                                       
                                    }}
                                    checked = { globalState.dark.value === true }
                                 />
                                 <div className = "peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                              </label>
                           </div>
                        </div>
                     </div>
                     <div className = "relative mx-auto w-full">
                        <div className = "flex flex-row items-center justify-between gap-2">
                           <div className = "flex flex-row items-center justify-center gap-2">
                              <FontAwesomeIcon
                                 icon = { faCalendar }
                                 className = "w-8 text-xl text-primary"
                              />
                              <h2 className = "pl-2 text-xl font-semibold">
                                 Date Format
                              </h2>
                           </div>
                        </div>
                     </div>
                  </div>
                  <Button
                     type = "submit"
                     className = "h-[2.4rem] w-32 rounded-md bg-red-500 p-5 text-xs font-bold text-white xxsm:text-sm"
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