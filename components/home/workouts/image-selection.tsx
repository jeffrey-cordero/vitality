import Image from "next/image";
import ToolTip from "@/components/global/tooltip";
import clsx from "clsx";
import Button from "@/components/global/button";
import Input, { VitalityInputProps } from "@/components/global/input";
import { useCallback, useEffect, useState } from "react";
import { PopUp } from "@/components/global/popup";
import { faPaperclip, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const defaultImages = ["bike.png", "cardio.png", "default.png", "hike.png", "legs.png", "lift.png", "machine.png", "run.png", "swim.png", "weights.png"];
const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|svg))$/i;
const nextMediaRegex = /^\/workouts\/(bike|cardio|default|hike|legs|lift|machine|run|swim|weights)\.png$/;

function verifyURL(url: string): boolean {
   // URL may be relative to WWW or NextJS Static Media
   return urlRegex.test(url) || nextMediaRegex.test(url);
}

function ImageSelectionForm(props: VitalityInputProps): JSX.Element {
   const { input, dispatch } = props;
   const [isDefaultImage, setIsDefaultImage] = useState<boolean>(true);
   const isValidImage = input.data.valid;

   const handleImageURLSubmission = useCallback(() => {
      const isValidURL = verifyURL(input.value);

      dispatch({
         type: "updateState",
         value: {
            id: "image",
            input: {
               ...input,
               error: isValidURL ? null : "Invalid image URL",
               data: {
                  valid: isValidURL
               }
            }
         }
      });
   }, [dispatch, input]);

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
                  valid: true
               }
            }
         }
      });
   }, [dispatch, input]);

   return (
      <div className = "flex flex-col gap-3">
         <div className = "flex gap-8 font-bold text-lg">
            <h3
               onClick = {() => {
                  setIsDefaultImage(true);
               }}
               className = {clsx("cursor-pointer", {
                  "border-b-[3px] border-primary text-red": isDefaultImage
               })}>
               Defaults
            </h3>
            <h3
               onClick = {() => {
                  setIsDefaultImage(false);
               }}
               className = {clsx("cursor-pointer", {
                  "border-b-[3px] border-primary text-red": !(isDefaultImage)
               })}>
               URL
            </h3>
         </div>
         {
            isDefaultImage ?
               <div className = "flex flex-wrap gap-6 justify-center items-center p-6">
                  {
                     defaultImages.map((image) => {
                        const source = `/workouts/${image}`;

                        return (
                           <Image
                              width = {1000}
                              height = {1000}
                              quality = {100}
                              src = {source}
                              key = {source}
                              alt = "workout-image"
                              className = {clsx("w-[20rem] h-[20rem] object-cover object-center shadow-inner rounded-xl cursor-pointer", {
                                 "border-[4px] border-primary shadow-2xl scale-[1.05] transition duration-300 ease-in-out": input.value === source
                              })}
                              onClick = {() => handleDefaultImageSelection(source)}
                           />
                        );
                     })
                  }
               </div>
               :
               <div
                  className = "p-2"
                  onKeyDown = {(event: React.KeyboardEvent) => {
                     if (event.key === "Enter") {
                        handleImageURLSubmission();
                     }
                  }}>
                  {
                     isValidImage && (
                        <div className = "flex justify-center m-6">
                           <Image
                              width = {1000}
                              height = {1000}
                              quality = {100}
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
                                             valid: false
                                          }
                                       }
                                    }
                                 });
                              }}
                              alt = "workout-image"
                              className = {clsx("w-[20rem] h-[20rem] object-cover object-center rounded-xl cursor-pointer transition duration-300 ease-in-out")}
                           />
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
                                    valid: false
                                 }
                              }
                           }
                        });
                     }}
                  />
                  <Button
                     type = "button"
                     onClick = {() => handleImageURLSubmission()}
                     className = "w-full bg-primary text-white mt-2 font-semibold border-gray-200 border-[1.5px] min-h-[2.8rem] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500"
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
   const { input, dispatch } = props;
   const isValidImage: boolean = input.data.valid;
   const selected = input.value !== "";

   return (
      <div>
         <ToolTip
            tooltipContent = {
               verifyURL(input.value) && isValidImage ?
                  <Image
                     width = {1000}
                     height = {1000}
                     quality = {100}
                     src = {input.value}
                     onError = {() => {
                        dispatch({
                           type: "updateState",
                           value: {
                              id: "image",
                              input: {
                                 ...input,
                                 error: "Failed to fetch your desired image resource. Please ensure the link is valid.",
                                 data: {
                                    valid: false
                                 }
                              }
                           }
                        });
                     }}
                     alt = "workout-image"
                     className = {clsx("w-[13rem] h-[13rem] object-cover object-center rounded-2xl")}
                  /> : null}
         >
            <PopUp
               cover = {
                  <div>
                     <Button
                        className = {clsx("w-full text-black font-semibold border-[1.5px] h-[2.9rem] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500", {
                           "border-[1.5px] border-red-500": !(isValidImage) && selected
                        })}>
                        <FontAwesomeIcon icon = {selected ? faPenToSquare : faPaperclip} />
                        {selected ? "Edit Image" : "Add Image"}
                     </Button>
                     {input.error !== null &&
                        <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                           <p className = "text-red-500 font-bold input-error"> {input.error} </p>
                        </div>
                     }
                  </div>
               }
               className = "max-w-[80%]">
               <ImageSelectionForm {...props} />
            </PopUp>
         </ToolTip>
      </div>
   );
}