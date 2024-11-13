/** @jest-environment jsdom */
import { NotificationProps } from "@/components/global/notification";
import { handleResponse, sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";
import { VitalityAction } from "@/lib/global/state";
import { Dispatch } from "react";

const dispatch: Dispatch<VitalityAction<any>> = jest.fn();
const successMethod = jest.fn();
const updateNotification: (_notification: NotificationProps) => void =
  jest.fn();
let response: VitalityResponse<any>;

describe("Backend Response Validation", () => {
   test("Should remove current notifications and call success method on a successful backend response", async() => {
      response = sendSuccessMessage("Successfully processed request", true);
      handleResponse(dispatch, response, successMethod, updateNotification);

      expect(response.body.data).toEqual(true);
      expect(dispatch).not.toHaveBeenCalled();
      expect(updateNotification).toHaveBeenCalledWith({
         status: "Initial",
         message: ""
      });
      expect(successMethod).toHaveBeenCalled();
   });

   test("Should update errors in state, if applicable, and scroll any error elements into view for errors caught", async() => {
      response = sendErrorMessage("Error in user registration fields", {
         name: ["Name must be at least 2 characters"]
      });

      // Mock error element in DOM
      const mockElement = document.createElement("p");
      mockElement.className = "input-error";
      mockElement.scrollIntoView = jest.fn();

      jest.spyOn(document, "getElementsByClassName").mockReturnValue({
         item: jest.fn().mockReturnValue(mockElement),
         length: 1
      } as any);

      handleResponse(dispatch, response, successMethod, updateNotification);

      // Ensure null data in response and no success/notification methods are called
      expect(response.body.data).toBeNull();
      expect(updateNotification).not.toHaveBeenCalled();
      expect(successMethod).not.toHaveBeenCalled();

      // Ensure errors are updated and error elements are visible
      expect(dispatch).toHaveBeenCalledWith({
         type: "updateErrors",
         value: response
      });
      expect(document.getElementsByClassName).toHaveBeenCalledWith("input-error");
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
         behavior: "smooth",
         block: "center"
      });

      // Ensure null errors object parameter in uniform error message method defaults to empty object
      response = sendErrorMessage("Missing user ID", null);
      expect(response.body.errors).toEqual({});
   });

   test("Should display failure notification for failure caught on the backend", async() => {
      response = sendFailureMessage("Database connection error");
      handleResponse(dispatch, response, successMethod, updateNotification);

      expect(response.body.data).toBeNull();
      expect(dispatch).not.toHaveBeenCalled();
      expect(successMethod).not.toHaveBeenCalled();

      // Ensure default server error, where specific error is held in system errors array
      expect(updateNotification).toHaveBeenCalledWith({
         status: "Failure",
         message: "Internal Server Error. Please try again later."
      });

      expect(response.body.errors).toEqual({
         system: ["Database connection error"]
      });
   });
});