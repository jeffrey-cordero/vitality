import { Dispatch } from "react";

import { NotificationProps } from "@/components/global/notification";
import { VitalityAction } from "@/lib/global/reducer";

export interface VitalityResponse<T> {
   status: "Success" | "Error" | "Failure";
   body: {
     message: string;
     data: T;
     errors: Record<string, string[] | undefined>;
   };
 }

export function sendSuccessMessage<T>(message: string, data: T): VitalityResponse<T> {
   return {
      status: "Success",
      body: {
         data: data,
         message: message,
         errors: {}
      }
   };
}

export function sendErrorMessage<T>(message: string, errors: Record<string, string[] | undefined>): VitalityResponse<T> {
   return {
      status: "Error",
      body: {
         data: null,
         message: message,
         errors: errors ?? {}
      }
   };
}

export function sendFailureMessage<T>(error: Error): VitalityResponse<T> {
   // Error logs strictly within a development environment
   process.env.NODE_ENV === "development" && console.error(error);

   return {
      status: "Failure",
      body: {
         data: null,
         message: "Something went wrong. Please try again.",
         errors: {
            system: [error?.message]
         }
      }
   };
}

export function processResponse(
   response: VitalityResponse<any>,
   dispatch: Dispatch<VitalityAction<any>>,
   updateNotifications: (_notification: NotificationProps) => void,
   successMethod: () => void
): void {
   if (response.status === "Success") {
      // Call the success method provided
      successMethod.call(null);
   } else if (response.status === "Error" && Object.keys(response.body.errors).length > 0) {
      // Update state to display all errors found within the response
      dispatch({
         type: "processResponse",
         value: response
      });

      // Scroll into the first error element within the DOM
      document.getElementsByClassName("input-error")?.item(0)
         ?.scrollIntoView({ behavior: "smooth", block: "center" });
   } else {
      // Display failure or unique error notification to the user
      updateNotifications({
         status: response.status,
         message: response.body.message,
         timer: undefined
      });
   }
}