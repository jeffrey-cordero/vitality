import Image from "next/image";
import Input, { InputProps } from "@/components/global/input";
import PopUp from "@/components/global/popup";
import ToolTip from "@/components/global/tooltip";
import clsx from "clsx";
import Button from "@/components/global/button";
import { Dispatch, useState } from "react";
import { faPaperclip, faPenToSquare, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const defaultImages = ["bike.jpg", "cardio.jpg", "default.jpg", "hike.jpg", "legs.jpg", "lift.jpg", "machine.jpg", "run.jpg", "swim.jpg", "weights.jpg"]

function verifyURL(url: string): boolean {
   // URL may be relative to WWW or NextJS Static Media
   const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
   const nextMediaRegex = /^\/_next\/static\/media\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+\.jpg$/;

   return urlRegex.test(url) || nextMediaRegex.test(url);
}

function ImageSelectionForm(props: InputProps, isValidImage: boolean, setIsValidImage: Dispatch<boolean>): JSX.Element {
   const [isDefaultImage, setIsDefaultImage] = useState<boolean>(true);

   const handleURLSubmission = () => {
      const isValidURL = verifyURL(props.input.value);

      if (!(isValidURL)) {
         setIsValidImage(false);
      } else if (!(isValidImage)) {
         setIsValidImage(true);
      }

      props.dispatch({
         type: "updateInput",
         value: {
            ...props.input,
            error: isValidURL ? null : ["Invalid image URL"],
            data: {
               validIcon: isValidURL
            }
         }
      });
   }

   return (
      <div className="flex flex-col gap-3">
         <div className="flex gap-8 font-bold">
            <h3
               onClick={() => {
                  setIsDefaultImage(true);
               }}
               className={clsx("cursor-pointer", {
                  "border-b-[2.5px] border-primary text-red": isDefaultImage
               })}>
               Defaults
            </h3>
            <h3
               onClick={() => {
                  setIsDefaultImage(false);
               }}
               className={clsx("cursor-pointer", {
                  "border-b-[2.5px] border-primary text-red": !(isDefaultImage)
               })}>
               URL
            </h3>
         </div>
         {
            isDefaultImage ?
               <div className="flex flex-wrap gap-6 justify-center items-center p-6">
                  {
                     defaultImages.map((image) => {
                        const source = require(`@/public/workouts/${image}`).default.src;

                        return (
                           <Image
                              width={1000}
                              height={1000}
                              src={source}
                              key={source}
                              alt="workout-image"
                              className={clsx("w-[12rem] h-[12rem] object-cover object-center shadow-inner rounded-xl cursor-pointer", {
                                 "border-[4px] border-primary shadow-2xl scale-[1.05] transition duration-300 ease-in-out": props.input.value === source,
                              })}
                              onClick={() => {
                                 // All default images are valid images
                                 if(!(isValidImage)) {
                                    setIsValidImage(true);
                                 }
                                 
                                 props.dispatch({
                                    type: "updateInput",
                                    value: {
                                       ...props.input,
                                       value: source,
                                       error: null,
                                       data: {
                                          validIcon: true
                                       }
                                    }
                                 });
                              }}
                           />
                        )
                     })
                  }
               </div>
               :
               <div
                  className="p-6"
                  onKeyDown={(event: React.KeyboardEvent) => {
                     if (event.key === "Enter") {
                        handleURLSubmission();
                     }
                  }}>
                  {
                     isValidImage ? (
                        <div className="flex justify-center m-6">
                           <Image
                              width={1000}
                              height={1000}
                              src={props.input.value}
                              onError={() => {
                                 setIsValidImage(false);
                              }}
                              alt="workout-image"
                              className={clsx("w-[12rem] h-[12rem] object-cover object-center rounded-xl cursor-pointer transition duration-300 ease-in-out")}
                           />
                        </div>
                     ) :
                     // Show resource error on a valid image URL
                     verifyURL(props.input.value) && 
                        <div className="flex flex-col justify-center items-center text-center gap-4 m-6 font-bold">
                           <FontAwesomeIcon className="text-red-500 text-4xl" icon={faTriangleExclamation} />
                           <h2>Failed to fetch the desired image resource. Please try again.</h2>
                        </div>
                  }
                  <Input
                     {...props}
                     onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        // Ensure any changes to URL are verified on a new submission
                        if (isValidImage) {
                           setIsValidImage(false);
                        }

                        props.dispatch({
                           type: "updateInput",
                           value: {
                              ...props.input,
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
                     type="button"
                     onClick={() => {
                        handleURLSubmission();
                     }}
                     className="w-full bg-primary text-white mt-2 font-semibold border-gray-200 border-[1.5px] min-h-[2.7rem] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500"
                     icon={faPaperclip}
                  >
                     Link
                  </Button>
               </div>
         }
      </div>
   );
}

export default function ImageSelection(props: InputProps): JSX.Element {
   const [isValidImage, setIsValidImage] = useState<boolean>(verifyURL(props.input.value));
   const selected = props.input.value !== "";

   return (
      <div>
         <ToolTip
            tooltipContent={
               verifyURL(props.input.value) && isValidImage ? 
                  <Image
                     width={1000}
                     height={1000}
                     src={props.input.value}
                     onError={() => {
                        setIsValidImage(false);
                     }}
                     alt="workout-image"
                     className={clsx("w-[12rem] h-[12rem] object-cover object-center rounded-2xl")}
                  />
               : null}
         >
            <PopUp
               text={selected ? "Edit Image" : "Add Image"}
               icon={selected ? faPenToSquare : faPaperclip}
               className="max-w-[80%]"
               buttonClassName="w-full text-black font-semibold border-gray-200 border-[1.5px] min-h-[3.2rem] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500">
               { ImageSelectionForm(props, isValidImage, setIsValidImage) }
            </PopUp>
         </ToolTip>

      </div>
   );
}