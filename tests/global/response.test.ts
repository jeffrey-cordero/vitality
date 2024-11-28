/** @jest-environment jsdom */
import { Dispatch } from "react";
import { VitalityAction } from "@/lib/global/state";
import { NotificationProps } from "@/components/global/notification";
import { handleResponse, sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";

// Mocked dependencies
const dispatch: Dispatch<VitalityAction<any>> = jest.fn();
const successMethod: () => void = jest.fn();
const updateNotification: (_notification: NotificationProps) => void = jest.fn();

let response: VitalityResponse<any>;

describe("Backend Response Tests", () => {
   describe("Success response", () => {
      test("Handle successful backend response", () => {
         // Ensure notification is reset and success method is called
         response = sendSuccessMessage(
            "Successfully processed request",
            Number.MAX_VALUE
         );

         handleResponse(dispatch, response, successMethod, updateNotification);

         expect(response).toEqual({
            status: "Success",
            body: {
               data: Number.MAX_VALUE,
               message: "Successfully processed request",
               errors: {}
            }
         });
         expect(updateNotification).toHaveBeenCalledWith({
            status: "Initial",
            message: ""
         });
         expect(successMethod).toHaveBeenCalled();
         expect(dispatch).not.toHaveBeenCalled();
      });
   });

   describe("Error response", () => {
      test("Handle backend error response", () => {
         // Mock DOM methods to ensure error elements are target
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

         handleResponse(dispatch, response, successMethod, updateNotification);

         expect(response).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Error in user registration fields",
               errors: { name: ["Name must be at least 2 characters"] }
            }
         });
         expect(dispatch).toHaveBeenCalledWith({
            type: "updateErrors",
            value: response
         });
         expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
            behavior: "smooth",
            block: "center"
         });
         expect(successMethod).not.toHaveBeenCalled();
         expect(updateNotification).not.toHaveBeenCalled();
      });
   });

   describe("Failure response", () => {
      test("Handle failure backend responses gracefully", () => {
         // Mock console.error and node environment for failure message logging
         jest.spyOn(console, "error").mockImplementation();
         Object.defineProperty(process.env, "NODE_ENV", {
            value: "development",
            configurable: true
         });

         response = sendFailureMessage(new Error("Database connection error"));

         handleResponse(dispatch, response, successMethod, updateNotification);

         expect(response).toEqual({
            status: "Failure",
            body: {
               data: null,
               message: "Something went wrong. Please try again.",
               errors: { system: ["Database connection error"] }
            }
         });
         expect(updateNotification).toHaveBeenCalledWith({
            status: "Failure",
            message: "Something went wrong. Please try again."
         });
         expect(console.error).toHaveBeenCalled();
         expect(dispatch).not.toHaveBeenCalled();
         expect(successMethod).not.toHaveBeenCalled();
      });
   });
});