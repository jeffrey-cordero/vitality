import Image from "next/image";
import clsx from "clsx";
import Button from "@/components/global/button";
import Input, { VitalityInputProps } from "@/components/global/input";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/global/modal";
import { faCameraRetro, faGlobe, faPaperclip, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { verifyURL } from "@/lib/workouts/shared";

const defaultImages = ["bike.png", "cardio.png", "default.png", "hike.png", "legs.png", "lift.png", "machine.png", "run.png", "swim.png", "weights.png"];

interface ImageSelectionFormProps extends VitalityInputProps {
   isValidResource: boolean;
   isValidURL: boolean;
}

function ImageSelectionForm(props: ImageSelectionFormProps): JSX.Element {
   const { isValidURL, isValidResource, input, dispatch } = props;
   const [isDefaultImage, setIsDefaultImage] = useState<boolean>(true);


   const handleImageURLSubmission = useCallback(() => {
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
   }, [dispatch, input, isValidURL]);

   const handleDefaultImageSelection = useCallback((source: string) => {
      // All default images are valid images
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
   }, [dispatch, input]);

   useEffect(() => {
      if (isDefaultImage) {
         document.getElementById(input.value)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
   });

   return (
      <div className = "flex flex-col">
         <div className = "flex justify-start items-center text-left gap-4 mt-2 mb-4 text-sm">
            <Button
               icon = {faCameraRetro}
               onClick = {(event: React.MouseEvent) => {
                  event.stopPropagation();
                  setIsDefaultImage(true);
               }}
               className = {clsx("transition duration-300 ease-in-out", {
                  "scale-105 border-b-4 border-b-primary rounded-none": isDefaultImage
               })}>
               Defaults
            </Button>
            <Button
               icon = {faGlobe}
               onClick = {(event: React.MouseEvent) => {
                  event.stopPropagation();
                  setIsDefaultImage(false);
               }}
               className = {clsx("transition duration-300 ease-in-out", {
                  "scale-105  border-b-4 border-b-primary rounded-none": !(isDefaultImage)
               })}>
               URL
            </Button>
         </div>
         {
            isDefaultImage ?
               <div
                  tabIndex = {0}
                  className = "flex flex-wrap gap-6 justify-center items-center px-2 py-4">
                  {
                     defaultImages.map((image) => {
                        const source = `/workouts/${image}`;

                        return (
                           <div
                              tabIndex = {0}
                              id = {source}
                              onKeyDown = {(event) => {
                                 if (event.key === "Enter" || event.key === " ") {
                                    handleDefaultImageSelection(source);
                                 }
                              }}
                              className = "relative w-[12rem] h-[12rem]"
                              key = {source}>
                              <Image
                                 fill
                                 priority
                                 quality = {100}
                                 sizes = "100%"
                                 src = {source}
                                 key = {source}
                                 alt = "workout-image"
                                 className = {clsx("object-cover object-center shadow-inner rounded-xl cursor-pointer", {
                                    "border-[4px] border-primary shadow-2xl scale-[1.05] transition duration-300 ease-in-out": input.value === source
                                 })}
                                 onClick = {(event: React.MouseEvent) => {
                                    event.stopPropagation();
                                    handleDefaultImageSelection(source);
                                 }}
                              />
                           </div>

                        );
                     })
                  }
               </div>
               :
               <div
                  onKeyDown = {(event: React.KeyboardEvent) => {
                     if (event.key === "Enter") {
                        handleImageURLSubmission();
                     }
                  }}
                  className = "relative w-full h-full mx-auto"
               >
                  {
                     isValidResource && isValidURL && (
                        <div className = "flex justify-center items-center my-6">
                           <div className = "relative w-[12rem] h-[12rem]">
                              <Image
                                 fill
                                 priority
                                 quality = {100}
                                 sizes = "100%"
                                 src = {input.value}
                                 onError = {() => {
                                    // Resource removed, moved temporarily, etc.
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
                                 }}
                                 alt = "workout-image"
                                 className = {clsx("object-cover object-center rounded-xl cursor-default border-[4px] border-primary shadow-md scale-[1.05] transition duration-300 ease-in-out")}
                              />
                           </div>
                        </div>
                     )
                  }
                  <Input
                     {...props}
                     onChange = {(event: React.ChangeEvent<HTMLInputElement>) => {
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
                     }}
                  />
                  <Button
                     type = "button"
                     onClick = {(event: React.MouseEvent) => {
                        event.stopPropagation();
                        handleImageURLSubmission();
                     }}
                     className = "w-full bg-primary text-white mt-2 font-semibold  h-[2.4rem] placeholder:text-transparent"
                     icon = {faPaperclip}
                  >
                     Link
                  </Button>
               </div>
         }
      </div>
   );
}

export default function ImageSelection(props: VitalityInputProps): JSX.Element {
   const { input } = props;
   const isValidResource: boolean = input.data.valid !== false;
   const isValidURL: boolean = useMemo(() => {
      return verifyURL(input.value);
   }, [input.value]);
   const addedImage: boolean = isValidResource && isValidURL;

   return (
      <div>
         <Modal
            display = {
               <div>
                  <Button
                     className = {clsx("w-full text-black font-semibold border-[1.5px] px-4 py-2 h-[2.4rem] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500", {
                        "border-[1.5px] border-red-500": !(isValidResource)
                     })}>
                     <FontAwesomeIcon icon = {addedImage ? faPenToSquare : faPaperclip} />
                     {addedImage ? "Edit Image" : "Add Image"}
                  </Button>
                  {input.error !== null &&
                     <div className = "flex justify-center align-center text-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                        <p className = "text-red-500 font-bold input-error"> {input.error} </p>
                     </div>
                  }
               </div>
            }
            className = "max-w-[90%] sm:max-w-xl max-h-[90%] mt-12">
            <ImageSelectionForm
               {...props}
               isValidResource = {isValidResource}
               isValidURL = {isValidURL}
            />
         </Modal>
      </div>
   );
}