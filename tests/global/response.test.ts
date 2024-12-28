/** @jest-environment jsdom */
import { Dispatch } from "react";

import { NotificationProps } from "@/components/global/notification";
import { VitalityAction } from "@/lib/global/reducer";
import { processResponse, sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";

// Mocked dependencies
const dispatch: Dispatch<VitalityAction<any>> = jest.fn();
const successMethod: () => void = jest.fn();
const updateNotifications: (_notification: NotificationProps) => void = jest.fn();

let response: VitalityResponse<any>;

describe("Response Tests", () => {
   describe("Success response", () => {
      test("Should handle successful backend responses gracefully", () => {
         // Ensure the success method is called
         response = sendSuccessMessage("Successfully processed request", null);

         processResponse(response, dispatch, updateNotifications, successMethod);

         expect(response).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Successfully processed request",
               errors: {}
            }
         });
         expect(successMethod).toHaveBeenCalled();
         expect(dispatch).not.toHaveBeenCalled();
         expect(updateNotifications).not.toHaveBeenCalled();
      });
   });

   describe("Error response", () => {
      test("Should handle backend response errors gracefully", () => {
         // Mock DOM methods to ensure error elements are visible post-response
         const mockElement = Object.assign(document.createElement("p"), {
            className: "input-error",
            scrollIntoView: jest.fn()
         });

         jest.spyOn(document, "getElementsByClassName").mockReturnValue({
            item: jest.fn().mockReturnValue(mockElement),
            length: 1
         } as unknown as HTMLCollection);

         response = sendErrorMessage("Error in user registration fields", {
            name: ["Name must be at least 2 characters"]
         });

         processResponse(response, dispatch, updateNotifications, successMethod);

         expect(response).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Error in user registration fields",
               errors: { name: ["Name must be at least 2 characters"] }
            }
         });
         expect(dispatch).toHaveBeenCalledWith({
            type: "processResponse",
            value: response
         });
         expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
            behavior: "smooth",
            block: "center"
         });
         expect(updateNotifications).not.toHaveBeenCalled();
         expect(successMethod).not.toHaveBeenCalled();
      });
   });

   describe("Failure response", () => {
      test("Should handle failed backend responses gracefully", () => {
         // Mock console.error and node environment for failure message logging
         jest.spyOn(console, "error").mockImplementation();
         Object.defineProperty(process.env, "NODE_ENV", {
            value: "development",
            configurable: true
         });

         const error = new Error("Database connection error");
         response = sendFailureMessage(error);

         processResponse(response, dispatch, updateNotifications, successMethod);

         expect(response).toEqual({
            status: "Failure",
            body: {
               data: null,
               message: "Something went wrong. Please try again.",
               errors: { system: ["Database connection error"] }
            }
         });
         expect(updateNotifications).toHaveBeenCalledWith({
            status: "Failure",
            message: "Something went wrong. Please try again."
         });
         expect(console.error).toHaveBeenCalledWith(error);
         expect(dispatch).not.toHaveBeenCalled();
         expect(successMethod).not.toHaveBeenCalled();
      });
   });
});