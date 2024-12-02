import Image from "next/image";
import clsx from "clsx";
import Button from "@/components/global/button";
import Modal from "@/components/global/modal";
import { Input, VitalityInputProps } from "@/components/global/input";
import { useCallback, useEffect, useMemo, useState } from "react";
import { faCameraRetro, faPaperclip, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

interface ImagesFormProps extends VitalityInputProps {
   isValidResource: boolean;
   isValidURL: boolean;
}

function ImagesForm(props: ImagesFormProps): JSX.Element {
   const { isValidURL, isValidResource, input, dispatch } = props;
   const [isDefaultImage, setIsDefaultImage] = useState<boolean>(true);

   const handleImageURLUpdates = useCallback(() => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            input: {
               ...input,
               error: isValidURL ? null : "Invalid image URL",
               data: {
                  ...input.data,
                  valid: isValidURL
               }
            }
         }
      });
   }, [
      dispatch,
      input,
      isValidURL
   ]);

   const handleDefaultImageSelection = useCallback(
      (source: string) => {
         // All default images are valid image URL's
         dispatch({
            type: "updateState",
            value: {
               id: "image",
               input: {
                  ...input,
                  value: source,
                  error: null,
                  data: {
                     ...input.data,
                     valid: true
                  }
               }
            }
         });
      }, [
         dispatch,
         input
      ]);

   const handleImageResourceError = useCallback(() => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            input: {
               ...input,
               error: "Failed to fetch your desired image resource. Please ensure the link is valid.",
               data: {
                  ...input.data,
                  valid: false
               }
            }
         }
      });
   }, [
      dispatch,
      input
   ]);

   const handleImageURLReset = useCallback(() => {
      dispatch({
         type: "updateState",
         value: {
            id: "image",
            input: {
               ...input,
               error: null,
               value: "",
               data: {
                  valid: undefined
               }
            }
         }
      });
   }, [
      dispatch,
      input
   ]);

   return (
      <div className = "flex flex-col py-2">
         <div className = "flex justify-center items-center flex-wrap text-center gap-3 mt-2 mb-4 text-md">
            <Button
               icon = { faCameraRetro }
               onClick = {
                  (event: React.MouseEvent) => {
                     event.stopPropagation();
                     setIsDefaultImage(true);
                  }
               }
               className = {
                  clsx("transition duration-300 ease-in-out", {
                     "scale-105 border-b-4 border-b-primary rounded-none":
                     isDefaultImage
                  })
               }>
               Default
            </Button>
            <Button
               icon = { faPaperclip }
               onClick = {
                  (event: React.MouseEvent) => {
                     event.stopPropagation();
                     setIsDefaultImage(false);
                  }
               }
               className = {
                  clsx("transition duration-300 ease-in-out", {
                     "scale-105  border-b-4 border-b-primary rounded-none":
                     !isDefaultImage
                  })
               }>
               URL
            </Button>
         </div>
         {
            isDefaultImage ? (
               <div
                  tabIndex = { 0 }
                  className = "relative flex flex-wrap gap-6 justify-center items-center px-2 py-4">
                  {
                     images.map((image) => {
                        const source: string = `/workouts/${image}`;
                        const isSelected: boolean = input.value === source;

                        return (
                           <div
                              tabIndex = { 0 }
                              id = { source }
                              onKeyDown = {
                                 (event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                       handleDefaultImageSelection(source);
                                    }
                                 }
                              }
                              className = "relative w-[12rem] h-[12rem]"
                              key = { source }>
                              <Image
                                 fill
                                 priority
                                 quality = { 100 }
                                 sizes = "100%"
                                 src = { source }
                                 key = { source }
                                 alt = "workout-image"
                                 className = {
                                    clsx(
                                       "object-cover object-center shadow-inner rounded-xl cursor-pointer", {
                                          "border-primary border-[4px] shadow-2xl scale-[1.05] transition duration-300 ease-in-out": isSelected
                                       }
                                    )
                                 }
                                 onClick = { () => !isSelected ? handleDefaultImageSelection(source) : handleImageURLReset() }
                              />
                           </div>
                        );
                     })
                  }
               </div>
            ) : (
               <div
                  onKeyDown = {
                     (event: React.KeyboardEvent) => {
                        if (event.key === "Enter") {
                           handleImageURLUpdates();
                        }
                     }
                  }
                  className = "relative w-full h-full mx-auto">
                  {
                     isValidResource && isValidURL && (
                        <div className = "flex justify-center items-center my-6">
                           <div className = "relative w-[12rem] h-[12rem]">
                              <Image
                                 fill
                                 priority
                                 quality = { 100 }
                                 sizes = "100%"
                                 src = { input.value }
                                 onError = { handleImageResourceError }
                                 alt = "workout-image"
                                 className = {
                                    clsx(
                                       "object-cover object-center rounded-xl cursor-default border-[4px] border-primary shadow-md scale-[1.05] transition duration-300 ease-in-out",
                                    )
                                 }
                              />
                           </div>
                        </div>
                     )
                  }
                  <Input
                     { ...props }
                     onChange = {
                        (event: React.ChangeEvent<HTMLInputElement>) => {
                           // Ensure any changes to URL are verified on a new submission
                           dispatch({
                              type: "updateState",
                              value: {
                                 id: "image",
                                 input: {
                                    ...input,
                                    value: event.target.value,
                                    error: null,
                                    data: {
                                       ...input.data,
                                       valid: undefined
                                    }
                                 }
                              }
                           });
                        }
                     }
                  />
                  <Button
                     type = "button"
                     onClick = { handleImageURLReset }
                     className = "w-full px-4 py-2 mt-2 font-semibold border-gray-100 border-[1.5px] h-[2.4rem] focus:border-blue-500 focus:ring-blue-500 text-red-500"
                     icon = { faTrashCan }>
                  Remove
                  </Button>
                  <Button
                     type = "button"
                     onClick = { handleImageURLUpdates }
                     className = "w-full bg-primary text-white mt-2 font-semibold h-[2.4rem] placeholder:text-transparent"
                     icon = { faPaperclip }>
                  Add
                  </Button>
               </div>
            )
         }
      </div>
   );
}

export default function Images(props: VitalityInputProps): JSX.Element {
   const { input } = props;
   const isValidResource: boolean = useMemo(() => {
      return input.data.valid !== false && input.value.trim().length !== 0;
   }, [
      input.data.valid,
      input.value
   ]);
   const isValidURL: boolean = useMemo(() => {
      return verifyImageURL(input.value);
   }, [input.value]);
   const addedImage: boolean = isValidResource && isValidURL;

   return (
      <div>
         <Modal
            display = {
               <div>
                  <Button
                     className = {
                        clsx(
                           "w-full font-semibold border-[1.5px] dark:border-0 dark:bg-gray-700/50 px-4 py-2 h-[2.6rem] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500",
                           {
                              "border-[2px] dark:border-[2px] border-red-500 text-red-500": input.error
                           },
                        )
                     }>
                     <FontAwesomeIcon
                        icon = { addedImage ? faPenToSquare : faPaperclip }
                     />
                     { addedImage ? "Edit Image" : "Add Image" }
                  </Button>
                  {
                     input.error !== null && (
                        <div className = "flex justify-center align-center text-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                           <p className = "text-red-500 font-bold input-error">
                              { " " }
                              { input.error }{ " " }
                           </p>
                        </div>
                     )
                  }
               </div>
            }
            className = "max-w-[90%] sm:max-w-xl max-h-[90%] mt-12">
            <ImagesForm
               { ...props }
               isValidResource = { isValidResource }
               isValidURL = { isValidURL }
            />
         </Modal>
      </div>
   );
}