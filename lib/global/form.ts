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

export function handleFormErrors (response: SubmissionStatus, updater: Updater<FormItems>) {
   const errors = {};

   // Show error inputs
   for (const error of Object.keys(response.errors)) {
      errors[error] = true;

      updater((inputs) => {
         inputs[error].error = response.errors[error][0];
      });
   }

   // Hide fixed error inputs
   for (const input of Object.keys(updater)) {
      if (!(errors[input]) && updater[input].error !== null) {
         updater((inputs) => {
            inputs[input].error = null;
         });
      }
   }
}

export function sendSuccessMessage (message: string, data?: any): SubmissionStatus {
   return {
      state: "Success",
      response: { message: message, data: data },
      errors: {}
   };
}

export function sendErrorMessage (status: "Error" | "Failure", message: string, errors?: { [key: string]: string[] }): SubmissionStatus {
   return {
      state: status,
      response: { message: message },
      errors: errors ?? {}
   };
}