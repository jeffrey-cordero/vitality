/** @jest-environment jsdom */
import { Dispatch } from "react";
import { VitalityAction } from "@/lib/global/state";
import { NotificationProps } from "@/components/global/notification";
import { handleResponse, sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";

const dispatch: Dispatch<VitalityAction<any>> = jest.fn();
let response: VitalityResponse<any>;
const successMethod: () => void = jest.fn();
const updateNotification: (_notification: NotificationProps) => void = jest.fn();

describe("Backend Response", () => {
   test("Success Backend Response", async() => {
      response = sendSuccessMessage("Successfully processed request", Number.MAX_VALUE);
      handleResponse(dispatch, response, successMethod, updateNotification);

      expect(updateNotification).toHaveBeenCalledWith({
         status: "Initial",
         message: ""
      });
      expect(response.body.data).toEqual(Number.MAX_VALUE);
      expect(dispatch).not.toHaveBeenCalled();
      expect(successMethod).toHaveBeenCalled();
   });

   test("Error Backend Response", async() => {
      // Mock error element within the DOM
      const mockElement = document.createElement("p");
      mockElement.className = "input-error";
      mockElement.scrollIntoView = jest.fn();
      jest.spyOn(document, "getElementsByClassName").mockReturnValue({
         item: jest.fn().mockReturnValue(mockElement),
         length: 1
      } as any);

      response = sendErrorMessage("Error in user registration fields", {
         name: ["Name must be at least 2 characters"]
      });
      handleResponse(dispatch, response, successMethod, updateNotification);

      expect(dispatch).toHaveBeenCalledWith({
         type: "updateErrors",
         value: response
      });
      expect(response.body.data).toBeNull();
      expect(successMethod).not.toHaveBeenCalled();
      expect(updateNotification).not.toHaveBeenCalled();
      expect(document.getElementsByClassName).toHaveBeenCalledWith("input-error");
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
         behavior: "smooth",
         block: "center"
      });
   });

   test("Failure Backend Response", async() => {
      // Mock console.error method
      jest.spyOn(console, "error").mockImplementation();

      response = sendFailureMessage(new Error("Database connection error"));
      handleResponse(dispatch, response, successMethod, updateNotification);

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