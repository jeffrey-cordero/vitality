import { faCameraRetro, faImage, faPaperclip, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";

import Button from "@/components/global/button";
import { Input, VitalityInputProps } from "@/components/global/input";
import Modal from "@/components/global/modal";
import { settingsImagesRegex, workoutImagesRegex } from "@/lib/global/regex";
import { verifyImageURL } from "@/lib/home/workouts/shared";

interface FormProps extends ImageFormProps, VitalityInputProps {
   url: string;
   isValidURL: boolean;
   isValidResource: boolean;
   onSubmit?: () => Promise<void>;
}

function Form(props: FormProps): JSX.Element {
   const { page, images, url, isValidURL, isValidResource, input, dispatch, onSubmit } = props;
   const [isDefaultImage, setIsDefaultImage] = useState<boolean>(
      url === "" || page === "workouts" ? workoutImagesRegex.test(url) : settingsImagesRegex.test(url)
   );
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

   const updateImageURL = useCallback(() => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            value: {
               error: verifyImageURL(url) ? null : "Invalid image URL",
               data: {
                  valid: verifyImageURL(url)
               }
            }
         }
      });
   }, [
      url,
      dispatch
   ]);

   const selectDefaultImage = useCallback((source: string) => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            value: {
               value: source,
               error: null,
               data: {
                  valid: true
               }
            }
         }
      });
   }, [dispatch]);

   const updateImageURLInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            value: {
               value: event.target.value,
               error: null,
               // URL changes are verified on link submissions
               data: {
                  valid: undefined
               }
            }
         }
      });
   }, [dispatch]);

   const resetImageURL = useCallback(() => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            value: {
               error: null,
               value: "",
               data: {
                  valid: undefined
               }
            }
         }
      });
   }, [dispatch]);

   const displayImageResourceErrors = () => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            value: {
               error: "Failed to fetch your desired image resource",
               data: {
                  valid: false
               }
            }
         }
      });
   };

   return (
      <div className = "flex flex-col py-2">
         <div className = "mb-4 mt-2 flex flex-wrap items-center justify-center gap-3 text-center text-base">
            <Button
               icon = { faCameraRetro }
               onClick = { () => setIsDefaultImage(true) }
               className = {
                  clsx("transition duration-300 ease-in-out focus:text-primary focus:ring-transparent", {
                     "scale-105 border-b-4 border-b-primary rounded-none": isDefaultImage
                  })
               }
            >
               Default
            </Button>
            <Button
               icon = { faPaperclip }
               onClick = { () => setIsDefaultImage(false) }
               className = {
                  clsx("transition duration-300 ease-in-out focus:text-primary focus:ring-transparent", {
                     "scale-105 border-b-4 border-b-primary rounded-none": !isDefaultImage
                  })
               }
            >
               URL
            </Button>
         </div>
         {
            isDefaultImage ? (
               <div
                  tabIndex = { 0 }
                  className = "relative flex flex-wrap items-center justify-center gap-6 py-4"
               >
                  {
                     images.map((image) => {
                        const source: string = `/${page}/${image}`;
                        const isSelected: boolean = url === source;

                        return (
                           <div
                              id = { source }
                              className = "relative size-64 sm:size-48"
                              key = { source }
                           >
                              <Image
                                 fill
                                 priority
                                 tabIndex = { 0 }
                                 quality = { 100 }
                                 sizes = "100%"
                                 src = { source }
                                 key = { source }
                                 alt = { `${page}-image` }
                                 className = {
                                    clsx(
                                       "cursor-pointer rounded-xl object-cover object-center transition duration-300 ease-in-out", {
                                          "border-primary border-[4px] scale-[1.07]": isSelected
                                       }
                                    )
                                 }
                                 onKeyDown = { (event: React.KeyboardEvent) => event.key === "Enter" && !isSelected ? selectDefaultImage(source) : resetImageURL() }
                                 onClick = { () => !isSelected ? selectDefaultImage(source) : resetImageURL() }
                              />
                           </div>
                        );
                     })
                  }
               </div>
            ) : (
               <div className = "relative mx-auto size-full">
                  {
                     isValidResource && isValidURL && (
                        <div className = "my-6 flex items-center justify-center">
                           <div className = "relative size-64">
                              <Image
                                 fill
                                 priority
                                 quality = { 100 }
                                 sizes = "100%"
                                 src = { url }
                                 onError = { displayImageResourceErrors }
                                 alt = "workout-image"
                                 className = {
                                    clsx(
                                       "scale-105 cursor-default rounded-xl object-cover object-center shadow-md transition duration-300 ease-in-out",
                                    )
                                 }
                              />
                           </div>
                        </div>
                     )
                  }
                  <Input
                     { ...props }
                     onChange = { updateImageURLInput }
                     onSubmit = {
                        onSubmit === undefined ? updateImageURL : () => {
                           setTimeout(() => updateButtonRef.current?.submit());
                        }
                     }
                  />
                  {
                     url.length > 0 && (
                        <div className = "relative">
                           {
                              input.data?.valid && (
                                 <Button
                                    type = "button"
                                    onClick = { resetImageURL }
                                    className = "mt-2 h-10 w-full bg-red-500 px-4 py-2 font-semibold text-white focus:ring-red-700"
                                    icon = { faTrashCan }
                                 >
                                    Remove
                                 </Button>
                              )
                           }
                           {
                              input.data?.valid !== true && onSubmit === undefined && (
                                 <Button
                                    type = "button"
                                    onClick = { updateImageURL }
                                    className = "mt-2 h-10 w-full bg-primary font-semibold text-white placeholder:text-transparent"
                                    icon = { faPaperclip }
                                 >
                                    Add
                                 </Button>
                              )
                           }

                        </div>
                     )
                  }
               </div>
            )
         }
         {
            onSubmit && (
               <Button
                  ref = { updateButtonRef }
                  className = "mt-2 h-[41.6px] whitespace-nowrap rounded-md bg-primary p-5 text-sm font-bold text-white xxsm:text-base"
                  icon = { faImage }
                  onClick = { () => updateButtonRef.current?.submit() }
                  onSubmit = { onSubmit }
               >
                  Update
               </Button>
            )
         }
      </div>
   );
}

interface ImageFormProps extends VitalityInputProps {
   page: "workouts" | "settings";
   images: string[];
   display?: React.ReactNode
   onSubmit?: () => Promise<void>
}

export default function ImageForm(props: ImageFormProps): JSX.Element {
   const { input, display } = props;
   const url: string = input.value.trim();
   const isValidResource: boolean = input.data?.valid === true && url.length !== 0;
   const isValidURL: boolean = useMemo(() => {
      return verifyImageURL(url);
   }, [url]);

   return (
      <div
         id = "image-form-container"
         className = "relative"
      >
         <Modal
            display = {
               display ?? (
                  <div className = "relative">
                     <Button
                        className = {
                           clsx(
                              "h-[2.6rem] w-full border-[1.5px] px-4 py-2 text-sm font-semibold placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 xxsm:text-base dark:border-0 dark:bg-gray-700/50",
                              {
                                 "border-[2px] dark:border-[2px] border-red-500 text-red-500": input.error
                              },
                           )
                        }
                     >
                        <FontAwesomeIcon
                           icon = { isValidURL ? faPenToSquare : faPaperclip }
                        />
                        { isValidResource ? "Edit Image" : "Add Image" }
                     </Button>
                     {
                        input.error !== null && (
                           <div className = "mx-auto flex max-w-[90%] animate-fadeIn items-center justify-center gap-2 p-3 text-center opacity-0">
                              <p className = "input-error font-bold text-red-500">
                                 { input.error }
                              </p>
                           </div>
                        )
                     }
                  </div>
               )
            }
            className = "mt-12 max-h-[90%] max-w-[95%] sm:max-w-xl"
         >
            <Form
               { ...props }
               url = { url }
               isValidResource = { isValidResource }
               isValidURL = { isValidURL }
            />
         </Modal>
      </div>
   );
}