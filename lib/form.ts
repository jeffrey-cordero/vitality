export type FormItems = { [key: string]: InputState };

export type InputState = {
   label: string;
   type: string;
   isPassword?: boolean;
   id: string;
   value: any;
   error: any | null;
};

export type SubmissionStatus = {
   state: "Initial" | "Error" | "Success" | "Failure";
   response: { message?: string, data?: any };
   errors: { [key: string]: string[]; };
};

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
      errors: errors ? errors : { "System" : ["Unknown error has occurred when processing your request. Please try again."] }
   };
}