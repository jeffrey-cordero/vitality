import { faCameraRetro, faImages, faPaperclip, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Button from "@/components/global/button";
import Error from "@/components/global/error";
import { Input, VitalityInputProps } from "@/components/global/input";
import Modal from "@/components/global/modal";
import { avatarImagesRegex, workoutImagesRegex } from "@/lib/global/regex";
import { verifyImageURL } from "@/lib/home/workouts/shared";

interface FormProps extends ImageFormProps, VitalityInputProps {
   url: string;
   isValidURL: boolean;
   isValidResource: boolean;
   onSubmit?: () => Promise<void>;
}

const workoutImages: string[] = [
   "bike.png",
   "cardio.png",
   "default.png",
   "hike.png",
   "legs.png",
   "lift.png",
   "machine.png",
   "run.png",
   "swim.png",
   "weights.png"
];

const avatarImages: string[] = [
   "one.png",
   "two.png",
   "three.png",
   "four.png",
   "five.png",
   "six.png",
   "seven.png",
   "eight.png",
   "nine.png",
   "ten.png"
];

function Form(props: FormProps): JSX.Element {
   const { page, url, isValidURL, isValidResource, input, dispatch, onSubmit } = props;
   const [isDefaultImage, setIsDefaultImage] = useState<boolean>(
      (url === "") || (page === "workouts" ? workoutImagesRegex.test(url) : avatarImagesRegex.test(url))
   );
   const updateButtonRef = useRef<{ submit: () => void; confirm: () => void }>(null);

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

      document.getElementById(source)?.scrollIntoView({ behavior: "smooth", block: "center" });
   }, [dispatch]);

   const verifyImageURLInput = useCallback(() => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            value: {
               error: isValidURL ? null : "Invalid image URL",
               data: {
                  valid: isValidURL
               }
            }
         }
      });
   }, [
      dispatch,
      isValidURL
   ]);

   const updateImageURLInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            value: {
               value: event.target.value,
               error: null,
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

   const displayImageResourceError = () => {
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

   useEffect(() => {
      // Scroll to the selected default image
      isDefaultImage && document.getElementById(url)?.scrollIntoView({ behavior: "smooth", block: "center" });
   });

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
                  className = "relative flex flex-wrap items-center justify-center gap-5 py-4 xxsm:gap-6"
               >
                  {
                     (page === "workouts" ? workoutImages : avatarImages).map((image) => {
                        // Default images are provided for the workouts and settings pages respectively
                        const source: string = `/${page}/${image}`;
                        const isSelected: boolean = url === source;

                        return (
                           <div
                              id = { source }
                              className = "relative size-32 min-[275px]:size-40 xxsm:size-44 min-[425px]:size-72 sm:size-48"
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
                           <div className = "relative size-32 min-[275px]:size-40 xxsm:size-44 min-[425px]:size-72">
                              <Image
                                 fill
                                 priority
                                 quality = { 100 }
                                 sizes = "100%"
                                 src = { url }
                                 onError = { displayImageResourceError }
                                 alt = "workout-image"
                                 className = {
                                    clsx(
                                       "scale-105 cursor-default rounded-xl object-cover object-center transition duration-300 ease-in-out",
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
                        onSubmit === undefined ? verifyImageURLInput : () => {
                           // Apply timeout to ensure the image URL is verified before submitting the form
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
                                    onClick = { verifyImageURLInput }
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
                  icon = { faImages }
                  onClick = { () => updateButtonRef.current?.submit() }
                  onSubmit = { onSubmit }
                  isSingleSubmission = { true }
                  inputIds = { [ "image" ] }
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
                        id = "image-form-button"
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
                     <Error message = { input.error } />
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