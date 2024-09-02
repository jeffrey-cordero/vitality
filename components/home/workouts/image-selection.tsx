import Image from "next/image";
import Input, { InputProps } from "@/components/global/input";
import PopUp from "@/components/global/popup";
import { FormEvent, useRef, useState } from "react";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";
import Button from "@/components/global/button";

function ImageSelectionForm(props: InputProps): React.ReactElement {
   const [isDefaultImage, setIsDefaultImage] = useState<boolean>(true);
   const urlInputRef = useRef<HTMLInputElement>(null);

   const handleURLSubmission = () => {
      const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

      // Use dispatch.updateSpecificInput to show error, if any

      return;
   }

   return (
      <div className = "flex flex-col gap-3">
         <div className = "flex gap-8 font-bold">
            <h3
               onClick = {() => {
                  setIsDefaultImage(true);
               }}
               className = {clsx("cursor-pointer", {
                  "border-b-[2.5px] border-primary text-red" : isDefaultImage
               })}>
                  Defaults
            </h3>
            <h3
               onClick = {() => {
                  setIsDefaultImage(false);
               }}
               className = {clsx("cursor-pointer", {
                  "border-b-[2.5px] border-primary text-red" : !(isDefaultImage)
               })}>
                  URL
            </h3>
         </div>
         {
            isDefaultImage ? 
               <h2>HELLO</h2> 
               : 
               <div>
                  <Input {...props} />
                  <Button 
                     type="button"
                     onClick={handleURLSubmission}
                     className = "w-full bg-primary text-white mt-2 font-semibold border-gray-200 border-[1.5px] min-h-[2.5rem] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500"
                     icon = {faPaperclip}
                  >
                     Link
                  </Button>
               </div>
         }
      </div>
   );
}

function CreateImageSelection(props: InputProps): JSX.Element {
   return (
      <div>
         <PopUp
            text = {"Add Image"}
            icon = {faPaperclip}
            buttonClassName = "w-full text-black font-semibold border-gray-200 border-[1.5px] min-h-[2.5rem] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500">
            <ImageSelectionForm {...props} />
         </PopUp>
      </div>
   );
}

export default function ImageSelection(props: InputProps): JSX.Element {
   const [isImageSelected, setIsImageSelected] = useState<boolean>(false);

   return (
      <div>
         {
            isImageSelected ?
               null
               : <CreateImageSelection {...props} />
         }
      </div>
   );
}


/*
<Image
   width = {500}
   height = {300}
   src = {require(`@/public/workouts/${props.image}.jpg`)}
   alt = "run"
   className = "w-full h-full object-cover object-center shadow-inner"
   onClick = {(e) => {
      const image = e.target as HTMLImageElement;
      console.log(image.src);
   }}
/>
*/