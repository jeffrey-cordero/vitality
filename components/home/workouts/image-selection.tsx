import Image from "next/image";
import ToolTip from "@/components/global/tooltip";
import clsx from "clsx";
import Button from "@/components/global/button";
import Input, { VitalityInputProps } from "@/components/global/input";
import { Dispatch, useCallback, useState } from "react";
import { PopUp } from "@/components/global/popup";
import { faPaperclip, faPenToSquare, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const defaultImages = ["bike.png", "cardio.png", "default.png", "hike.png", "legs.png", "lift.png", "machine.png", "run.png", "swim.png", "weights.png"];
const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
const nextMediaRegex = /^\/workouts\/(bike|cardio|default|hike|legs|lift|machine|run|swim|weights)\.png$/;

function verifyURL(url: string): boolean {
   // URL may be relative to WWW or NextJS Static Media
   return urlRegex.test(url) || nextMediaRegex.test(url);
}

interface ImageSelectionFormProps extends VitalityInputProps {
   isValidImage: boolean;
   setIsValidImage: Dispatch<boolean>;
}

function ImageSelectionForm(props: ImageSelectionFormProps): JSX.Element {
   const { input, dispatch, isValidImage, setIsValidImage } = props;
   const [isDefaultImage, setIsDefaultImage] = useState<boolean>(true);

   const handleImageURLSubmission = useCallback(() => {
      const isValidURL = verifyURL(input.value);

      if (!(isValidURL)) {
         setIsValidImage(false);
      } else if (!(isValidImage)) {
         setIsValidImage(true);
      }

      dispatch({
         type: "updateInput",
         value: {
            ...input,
            error: isValidURL ? null : ["Invalid image URL"],
            data: {
               validIcon: isValidURL
            }
         }
      });
   }, [dispatch, input, isValidImage, setIsValidImage]);

   const handleDefaultImageSelection = useCallback((source: string) => {
      // All default images are valid images
      if (!(isValidImage)) {
         setIsValidImage(true);
      }

      dispatch({
         type: "updateInput",
         value: {
            ...input,
            value: source,
            error: null,
            data: {
               validIcon: true
            }
         }
      });
   }, [dispatch, input, isValidImage, setIsValidImage]);

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
                     isValidImage ? (
                        <div className = "flex justify-center m-6">
                           <Image
                              width = {1000}
                              height = {1000}
                              quality = {100}
                              src = {input.value}
                              onError = {() => {
                                 // Resource removed, moved temporarily, etc.
                                 setIsValidImage(false);
                              }}
                              alt = "workout-image"
                              className = {clsx("w-[20rem] h-[20rem] object-cover object-center rounded-xl cursor-pointer transition duration-300 ease-in-out")}
                           />
                        </div>
                     ) :
                        // Show resource error on a valid image URL
                        verifyURL(input.value) &&
                        <div className = "flex flex-col justify-center items-center text-center gap-4 m-6 font-bold">
                           <FontAwesomeIcon className = "text-red-500 text-4xl" icon = {faTriangleExclamation} />
                           <h2>Failed to fetch the desired image resource. Please try again.</h2>
                        </div>
                  }
                  <Input
                     {...props}
                     onChange = {(event: React.ChangeEvent<HTMLInputElement>) => {
                        // Ensure any changes to URL are verified on a new submission
                        if (isValidImage) {
                           setIsValidImage(false);
                        }

                        dispatch({
                           type: "updateInput",
                           value: {
                              ...input,
                              value: event.target.value,
                              error: null,
                              data: {
                                 validIcon: false
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
   const { input } = props;
   const [isValidImage, setIsValidImage] = useState<boolean>(verifyURL(input.value));
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
                        setIsValidImage(false);
                     }}
                     alt = "workout-image"
                     className = {clsx("w-[12rem] h-[12rem] object-cover object-center rounded-2xl")}
                  />
                  : null}
         >
            <PopUp
               cover = {
                  <div>
                     <Button className = {clsx("w-full text-black font-semibold border-[1.5px] min-h-[3.2rem] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500", {
                        "border-[1.5px] border-red-500": !(isValidImage) && selected
                     })}>
                        {selected ? "Edit Image" : "Add Image"}
                        <FontAwesomeIcon icon = {selected ? faPenToSquare : faPaperclip} />
                     </Button>
                     {input.error !== null &&
                        <div className = "flex justify-center align-center max-w-[90%] mx-auto gap-2 p-3 opacity-0 animate-fadeIn">
                           <p className = "text-red-500 font-bold input-error"> {input.error[0]} </p>
                        </div>
                     }
                  </div>
               }
               className = "max-w-[80%]">
               <ImageSelectionForm {...props} isValidImage = {isValidImage} setIsValidImage = {setIsValidImage} />
            </PopUp>
         </ToolTip>
      </div>
   );
}