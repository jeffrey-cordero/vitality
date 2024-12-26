import { faCameraRetro, faPaperclip, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import Button from "@/components/global/button";
import { Input, VitalityInputProps } from "@/components/global/input";
import Modal from "@/components/global/modal";
import { workoutsImageRegex } from "@/lib/home/workouts/regex";
import { verifyImageURL } from "@/lib/home/workouts/shared";

const images = [
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

interface FormProps extends VitalityInputProps {
   url: string;
   isValidURL: boolean;
   isValidResource: boolean;
}

function Form(props: FormProps): JSX.Element {
   const { url, isValidURL, isValidResource, input, dispatch } = props;
   const [isDefaultImage, setIsDefaultImage] = useState<boolean>(url === "" || workoutsImageRegex.test(url));

   const updateImageURL = useCallback(() => {
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
                        const source: string = `/workouts/${image}`;
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
                                 alt = "workout-image"
                                 className = {
                                    clsx(
                                       "cursor-pointer rounded-xl object-cover object-center shadow-inner transition duration-300 ease-in-out", {
                                          "border-primary border-[4px] shadow-2xl scale-[1.07]": isSelected
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
               <div
                  onKeyDown = { (event: React.KeyboardEvent) => event.key === "Enter" && url.length > 0 && updateImageURL() }
                  className = "relative mx-auto size-full"
               >
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
                                       "scale-105 cursor-default rounded-xl border-4 border-primary object-cover object-center shadow-md transition duration-300 ease-in-out",
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
                              input.data?.valid !== true && (
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
      </div>
   );
}

export default function ImageForm(props: VitalityInputProps): JSX.Element {
   const { input } = props;
   const url: string = input.value.trim();
   const isValidResource: boolean = input.data?.valid === true && url.length !== 0;
   const isValidURL: boolean = useMemo(() => {
      return verifyImageURL(url);
   }, [url]);

   return (
      <div className = "relative">
         <Modal
            display = {
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