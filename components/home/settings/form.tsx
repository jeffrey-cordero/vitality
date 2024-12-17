import Image from "next/image";
import Button from "@/components/global/button";
import Loading from "@/components/global/loading";
import { useSession } from "next-auth/react";
import { users as User } from "@prisma/client";
import { Input } from "@/components/global/input";
import { AuthenticationContext, NotificationContext } from "@/app/layout";
import { endSession } from "@/lib/authentication/session";
import { VitalityInputProps } from "@/components/global/input";
import { formReducer, VitalityState } from "@/lib/global/state";
import { fetchUserInformation } from "@/lib/authentication/authorize";
import { faArrowRotateLeft, faEnvelope, faFeather, faRightFromBracket, faXmark, faPencil, faImage, faPhone, faUserSecret, faCalendar } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponse } from "@/lib/global/response";
import { updateUserAttribute } from "@/lib/settings/update";

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
   }
};

interface AttributeProps extends VitalityInputProps {
   editOnly?: boolean;
}

function Attribute(props: AttributeProps) {
   const { user } = useContext(AuthenticationContext);
   const { updateNotification } = useContext(NotificationContext);
   const { id, input, type, icon, editOnly, onBlur, dispatch } = props;
   const [isEditing, setIsEditing] = useState<boolean>(editOnly ?? false);

   const handleResetInput = useCallback(() => {
      dispatch({
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
      dispatch
   ]);

   console.log(user);

   const handleUpdateUser = useCallback(async() => {
      const response = await updateUserAttribute(user.id, id as any, type === "date" ? new Date(input.value) : input.value);

      handleResponse(response, dispatch, updateNotification, async() => {
         dispatch({
            type: "updateState",
            value: {
               id: id,
               input: {
                  ...input,
                  data: {
                     ...input.data,
                     valid: id === "image" ? true : undefined,
                     stored: type === "date" ? input.value.toISOString().split("T")[0] : input.value
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
      dispatch,
      editOnly,
      onBlur,
      input,
      updateNotification
   ]);

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
               <div className = "flex flex-row items-center justify-center gap-2">
                  <div className = "flex flex-row items-center justify-center gap-2">
                     <FontAwesomeIcon
                        icon = { icon }
                        className = "text-xl text-primary"
                     />
                     <h2 className = "text-xl font-semibold">
                        { input.data.stored }
                     </h2>
                  </div>
                  <FontAwesomeIcon
                     icon = { faPencil }
                     className = "cursor-pointer text-lg text-primary"
                     onClick = { () => setIsEditing(true) }
                  />
               </div>
            )
         }
      </div>
   );
}

export default function Form(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const [state, dispatch] = useReducer(formReducer, form);
   const [isEditingImage, setIsEditingImage] = useState<boolean>(false);

   const imageURL = useMemo(() => {
      return state.image.data.stored.trim();
   }, [state.image.data.stored]);

   const handleFetchUser = useCallback(async() => {
      const information: User = await fetchUserInformation(user.id);

      dispatch({
         type: "initializeState",
         value: {
            username: {
               ...state.username,
               value: information.username,
               data: {
                  stored: information.username
               }
            },
            name: {
               ...state.name,
               value: information.name,
               data: {
                  stored: information.name
               }
            },
            birthday: {
               ...state.birthday,
               value: information.birthday.toISOString().split("T")[0],
               data: {
                  stored: information.birthday.toISOString().split("T")[0]
               }
            },
            email: {
               ...state.email,
               value: information.email,
               data: {
                  stored: information.email
               }
            },
            phone: {
               ...state.phone,
               value: information.phone,
               data: {
                  stored: information.phone
               }
            },
            image: {
               ...state.image,
               value: information.image,
               data: {
                  ...state.image.data,
                  valid: true,
                  fetched: true,
                  stored: information.image
               }
            }
         }
      });
   }, [
      user,
      state.username,
      state.name,
      state.birthday,
      state.email,
      state.phone,
      state.image
   ]);

   const handleImageURLChanges = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      // Ensure any changes to URL are verified on a new submission
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            input: {
               ...state.image,
               value: event.target.value,
               error: null,
               data: {
                  ...state.image.data,
                  valid: undefined
               }
            }
         }
      });
   }, [
      dispatch,
      state.image
   ]);

   const handleImageResourceValidity = useCallback((valid: boolean) => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            input: {
               ...state.image,
               error: valid ? null : "Failed to fetch your desired image resource",
               data: {
                  ...state.image.data,
                  valid: valid
               }
            }
         }
      });
   }, [state.image]);

   useEffect(() => {
      if (!state.image.data.fetched) {
         handleFetchUser();
      }
   });

   return (
      <div className = "relative mx-auto w-7/12 text-left">
         {
            state.image.data.fetched ? (
               <div className = "flex flex-col items-center justify-center px-12">
                  <h1 className = "w-full border-b-4 border-b-primary pb-2 text-[1.5rem] font-extrabold leading-[2.7rem] text-primary xxsm:text-3xl sm:text-4xl">
                     My Profile
                  </h1>
                  <div className = "relative mx-auto flex w-full flex-col items-center justify-center gap-4 py-4">
                     {
                        !isEditingImage ? (
                           <div className = "relative mb-4 mt-2 size-48 overflow-hidden rounded-full border-4 border-primary shadow-md">
                              {
                                 state.image.data.valid === true ? (
                                    <Image
                                       fill
                                       priority
                                       tabIndex = { 0 }
                                       quality = { 100 }
                                       sizes = "100%"
                                       src = { imageURL === "" ? "/settings/default.png" : imageURL }
                                       alt = "workout-image"
                                       className = "cursor-pointer object-cover object-center shadow-md"
                                       onLoad = { () => state.image.data.valid === false && handleImageResourceValidity(true) }
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
                              <FontAwesomeIcon
                                 icon = { faPencil }
                                 className = "absolute right-[-15px] top-[-15px] z-10 cursor-pointer text-2xl text-primary transition duration-300 ease-in-out hover:scale-105"
                                 onClick = { () => setIsEditingImage(true) }
                              />
                           </div>
                        ) : (
                           <Attribute
                              id = "image"
                              type = "text"
                              label = "Image"
                              icon = { faImage }
                              input = { state.image }
                              dispatch = { dispatch }
                              onBlur = { () => setIsEditingImage(false) }
                              onChange = { handleImageURLChanges }
                              editOnly
                           />
                        )
                     }
                     <Attribute
                        id = "name"
                        type = "text"
                        label = "Name"
                        icon = { faFeather }
                        input = { state.name }
                        dispatch = { dispatch }
                     />
                     <Attribute
                        id = "username"
                        type = "text"
                        label = "Username"
                        icon = { faUserSecret }
                        input = { state.username }
                        dispatch = { dispatch }
                     />
                     <Attribute
                        id = "email"
                        type = "email"
                        label = "Email"
                        icon = { faEnvelope }
                        input = { state.email }
                        dispatch = { dispatch }
                     />
                     <Attribute
                        id = "birthday"
                        type = "date"
                        label = "Birthday"
                        icon = { faCalendar }
                        input = { state.birthday }
                        dispatch = { dispatch }
                     />
                     <Attribute
                        id = "phone"
                        type = "tel"
                        label = "Phone"
                        icon = { faPhone }
                        input = { state.phone }
                        dispatch = { dispatch }
                     />
                  </div>
                  <Button
                     type = "submit"
                     className = "flex h-[2.4rem] w-32 items-center justify-start gap-2 rounded-md bg-red-500 p-5 text-xs font-bold text-white xxsm:text-sm md:flex-none"
                     icon = { faRightFromBracket }
                     onClick = {
                        async() => {
                           await endSession();
                           window.location.reload();
                        }
                     }
                  >
                     <p>Sign Out</p>
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