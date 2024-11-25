/** @jest-environment jsdom */
import { Dispatch } from "react";
import { VitalityAction } from "@/lib/global/state";
import { NotificationProps } from "@/components/global/notification";
import { handleResponse, sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";

// Mocked dependencies
const dispatch: Dispatch<VitalityAction<any>> = jest.fn();
const successMethod: () => void = jest.fn();
const updateNotification: (_notification: NotificationProps) => void =
  jest.fn();

let response: VitalityResponse<any>;

describe("Backend Response", () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   afterEach(() => {
      jest.restoreAllMocks();
   });

   const verifyNotificationReset = () => {
      expect(updateNotification).toHaveBeenCalledWith({
         status: "Initial",
         message: ""
      });
   };

   describe("Success Backend Response", () => {
      test("Handles successful responses", () => {
         response = sendSuccessMessage(
            "Successfully processed request",
            Number.MAX_VALUE
         );

         handleResponse(dispatch, response, successMethod, updateNotification);

         // Only update notification and success methods should be triggered
         verifyNotificationReset();
         expect(successMethod).toHaveBeenCalled();
         expect(response.body.data).toEqual(Number.MAX_VALUE);
         expect(dispatch).not.toHaveBeenCalled();
      });
   });

   describe("Error Backend Response", () => {
      test("Handles error responses and scrolls towards error elements", () => {
         // Mock DOM element with scrollIntoView methods
         const mockElement = document.createElement("p");
         mockElement.className = "input-error";
         mockElement.scrollIntoView = jest.fn();
         jest.spyOn(document, "getElementsByClassName").mockReturnValue({
            item: jest.fn().mockReturnValue(mockElement),
            length: 1
         } as unknown as HTMLCollection);

         response = sendErrorMessage("Error in user registration fields", {
            name: ["Name must be at least 2 characters"]
         });

         handleResponse(dispatch, response, successMethod, updateNotification);

         // Only dispatch and scrollIntoView should be triggered
         expect(dispatch).toHaveBeenCalledWith({
            type: "updateErrors",
            value: response
         });
         expect(document.getElementsByClassName).toHaveBeenCalledWith(
            "input-error"
         );
         expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
            behavior: "smooth",
            block: "center"
         });
         expect(response.body.data).toBeNull();
         expect(successMethod).not.toHaveBeenCalled();
         expect(updateNotification).not.toHaveBeenCalled();
      });
   });

   describe("Failure Backend Response", () => {
      test("Handles failure responses gracefully", () => {
      // Mock console.error for logging based on node environment
         jest.spyOn(console, "error").mockImplementation();

         response = sendFailureMessage(new Error("Database connection error"));

         handleResponse(dispatch, response, successMethod, updateNotification);

         // Only update notification method should be triggered
         expect(updateNotification).toHaveBeenCalledWith({
            status: "Failure",
            message: "Something went wrong. Please try again."
         });
         expect(response.body.data).toBeNull();
         expect(response.body.errors).toEqual({
            system: ["Database connection error"]
         });
         expect(console.error).not.toHaveBeenCalled();
         expect(dispatch).not.toHaveBeenCalled();
         expect(successMethod).not.toHaveBeenCalled();
      });
   });
});