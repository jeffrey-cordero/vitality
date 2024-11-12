import { Dispatch } from "react";
import { VitalityAction } from "@/lib/global/state";
import { NotificationProps } from "@/components/global/notification";

export interface VitalityResponse<T> {
   status: "Success" | "Error" | "Failure";
   body: {
     message: string;
     data: T;
     errors: { [key: string]: string[] | undefined };
   };
 }

export function sendSuccessMessage<T>(
   message: string,
   data: T,
): VitalityResponse<T> {
   return {
      status: "Success",
      body: {
         data: data,
         message: message,
         errors: {}
      }
   };
}

export function sendErrorMessage<T>(
   status: "Error" | "Failure",
   message: string,
   data: T,
   errors: { [key: string]: string[] },
): VitalityResponse<T> {
   return {
      status: status,
      body: {
         data: data,
         message: message,
         errors: errors ?? {}
      }
   };
}

export function handleResponse(
   dispatch: Dispatch<VitalityAction<any>>,
   response: VitalityResponse<any>,
   successMethod: () => void,
   updateNotification: (_notification: NotificationProps) => void,
): void {
   if (response.status === "Success") {
      // Remove any existing notifications
      updateNotification({
         status: "Initial",
         message: ""
      });

      // Call the success method appropriately
      successMethod.call(null);
   } else if (
      response.status === "Error" &&
    Object.keys(response.body.errors).length > 0
   ) {
      // Update state to display all errors relative to the response
      dispatch({
         type: "updateErrors",
         value: response
      });

      document
         .getElementsByClassName("input-error")
         .item(0)
         ?.scrollIntoView({ behavior: "smooth", block: "center" });
   } else {
      // Display failure notification to the user
      updateNotification({
         status: response.status,
         message: response.body.message,
         timer: undefined
      });
   }
}