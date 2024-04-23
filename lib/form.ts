import { ChangeEvent } from "react";

export type InputFormat = {
   label: string;
   inputId: string;
   error: string;
   inputType?: string;
   value: any;
   onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export type SubmissionStatus = {
   status: 'initial' | 'errors' | 'success' | 'failure';
   data?: any;
   errors?: { [key: string]: string[]; };
};

export function sendSuccessMessage(data?: any): SubmissionStatus {
   return {
      status: "success",
      data: data ? data : null
   };
}

export function sendErrorMessage(status: 'errors' | 'failure', errors?: { [key: string]: string[] }): SubmissionStatus {
   return {
      status: status,
      errors: errors ? errors : { 'system' : ['Unknown error has occurred when processing your request. Please try again.'] }
   }
}