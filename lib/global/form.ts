import { ChangeEvent } from "react";
import { Updater } from "use-immer";

export type FormItems = { [key: string]: InputState };

export type InputState = {
   label: string;
   type?: string;
   isPassword?: boolean;
   id: string;
   value: any;
   error: any | null;
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
   input: InputState;
   updater: Updater<FormItems>;
}

export type SubmissionStatus = {
   state: "Initial" | "Error" | "Success" | "Failure";
   response: { message?: string, data?: any };
   errors: { [key: string]: string[]; };
};

export function updateFormState (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, updater: Updater<FormItems>) {
   const { id, value } = event.target;

   updater((input: { [key: string]: InputState; }) => {
      input[id].value = value;
      input[id].error = null;
   });
};

export function handleFormErrors (response: SubmissionStatus, items: FormItems, updater: Updater<FormItems>) {
   // Show new errors or hide prior errors
   for (const input of Object.keys(items)) {
      let error : string | null = null;

      if (response.errors[input]) {
         error = response.errors[input][0];
      }

      updater((inputs) => {
         inputs[input].error = error;
      });
   }
}

export function sendSuccessMessage (message: string, data?: any): SubmissionStatus {
   return {
      state: "Success",
      response: { message: message, data: data },
      errors: {}
   };
}

export function sendErrorMessage (status: "Error" | "Failure", message?: string, errors?: { [key: string]: string[] }): SubmissionStatus {
   return {
      state: status,
      response: { message: message ?? "Internal Server Error. Please try again later." },
      errors: errors ?? {}
   };
}