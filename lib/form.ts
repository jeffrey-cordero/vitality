import { ChangeEvent } from "react";

export type InputState = { 
   label: string;
   inputType?: string;
   inputId: string;
   value: any;
   error: string | null;
   onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export type SubmissionStatus = {
   state: 'Initial' | 'Error' | 'Success' | 'Failure';
   response?: { message: string, data?: any };
   errors?: { [key: string]: string[]; };
};

export function sendSuccessMessage(message: string, data?: any): SubmissionStatus {
   return {
      state: 'Success',
      response: { message: message, data: data }
   };
}

export function sendErrorMessage(status: 'Error' | 'Failure', errors?: { [key: string]: string[] }): SubmissionStatus {
   return {
      state: status,
      response: {message: 'Unknown error has occurred when processing your request. Please try again.'},
      errors: errors ? errors : { 'system' : ['Unknown error has occurred when processing your request. Please try again.'] }
   }
}