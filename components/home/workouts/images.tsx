import Image from "next/image";
import clsx from "clsx";
import Button from "@/components/global/button";
import Modal from "@/components/global/modal";
import { useCallback, useMemo, useState } from "react";
import { verifyImageURL } from "@/lib/home/workouts/shared";
import { workoutsImageRegex } from "@/lib/home/workouts/regex";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input, VitalityInputProps } from "@/components/global/input";
import { faCameraRetro, faPaperclip, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";

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
   url: string;
   isValidResource: boolean;
   isValidURL: boolean;
}

function ImagesForm(props: ImagesFormProps): JSX.Element {
   const { url, isValidURL, isValidResource, input, dispatch } = props;
   const [isDefaultImage, setIsDefaultImage] = useState<boolean>(url === "" || workoutsImageRegex.test(url));

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
               error: "Failed to fetch your desired image resource",
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

   const handleResetImageURL = useCallback(() => {
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

   const handleImageURLChanges = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
   }, [
      input,
      dispatch
   ]);

   return (
      <div className = "flex flex-col py-2">
         <div className = "mb-4 mt-2 flex flex-wrap items-center justify-center gap-3 text-center text-base">
            <Button
               icon = { faCameraRetro }
               onClick = {
                  (event: React.MouseEvent) => {
                     event.stopPropagation();
                     setIsDefaultImage(true);
                  }
               }
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
               onClick = {
                  (event: React.MouseEvent) => {
                     event.stopPropagation();
                     setIsDefaultImage(false);
                  }
               }
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
                                       "cursor-pointer rounded-xl object-cover object-center shadow-inner", {
                                          "border-primary border-[4px] shadow-2xl scale-[1.03] transition duration-300 ease-in-out": isSelected
                                       }
                                    )
                                 }
                                 onKeyDown = { (event: React.KeyboardEvent) => event.key === "Enter" && !isSelected ? handleDefaultImageSelection(source) : handleResetImageURL() }
                                 onClick = { () => !isSelected ? handleDefaultImageSelection(source) : handleResetImageURL() }
                              />
                           </div>
                        );
                     })
                  }
               </div>
            ) : (
               <div
                  onKeyDown = { (event: React.KeyboardEvent) => event.key === "Enter" && url.length > 0 && handleImageURLUpdates() }
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
                                 onError = { handleImageResourceError }
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
                     onChange = { handleImageURLChanges }
                  />
                  {
                     url.length > 0 && (
                        <div className = "relative">
                           {
                              input.data.valid && (
                                 <Button
                                    type = "button"
                                    onClick = { handleResetImageURL }
                                    className = "mt-2 h-10 w-full bg-red-500 px-4 py-2 font-semibold text-white focus:ring-red-700"
                                    icon = { faTrashCan }
                                 >
                                    Remove
                                 </Button>
                              )
                           }
                           {
                              input.data.valid !== true && (
                                 <Button
                                    type = "button"
                                    onClick = { handleImageURLUpdates }
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

export default function Images(props: VitalityInputProps): JSX.Element {
   const { input } = props;
   const url: string = input.value.trim();
   const isValidResource: boolean = useMemo(() => {
      return input.data.valid === true && url.length !== 0;
   }, [
      url,
      input.data.valid
   ]);
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
                     { isValidURL ? "Edit Image" : "Add Image" }
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
            <ImagesForm
               { ...props }
               url = { url }
               isValidResource = { isValidResource }
               isValidURL = { isValidURL }
            />
         </Modal>
      </div>
   );
}